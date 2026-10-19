import { getArtworks, getBio, getHomepage } from '$lib/api';
import type { Artwork, ArtworkRef, LayoutBlock, RowSlot } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const [artworks, homepage, bio] = await Promise.all([
		getArtworks(fetch),
		getHomepage(fetch),
		getBio(fetch)
	]);

	// Blocks only carry artwork references; look up the full (published) artwork for each.
	// Anything not found (e.g. an unpublished artwork) is treated as an empty slot.
	const byId = new Map(artworks.map((a) => [a.documentId, a]));
	const find = (ref: ArtworkRef | undefined): Artwork | null =>
		(ref && byId.get(ref.documentId)) ?? null;

	const blocks: LayoutBlock[] = [];

	const pushRow = (key: string, slots: RowSlot[]) => {
		if (slots.some((s) => s.artwork)) blocks.push({ kind: 'row', key, slots });
	};

	for (const raw of homepage?.layout ?? []) {
		const key = `${raw.__component}-${raw.id}`;
		switch (raw.__component) {
			case 'layout.hero': {
				const artwork = find(raw.artwork);
				if (!artwork) break;
				blocks.push({
					kind: 'hero',
					key,
					artwork,
					title: raw.title || artwork.title,
					subtitle: raw.subtitle || null
				});
				break;
			}
			case 'layout.heading':
				blocks.push({
					kind: 'heading',
					key,
					title: raw.title,
					description: raw.description || null
				});
				break;
			case 'layout.two-across':
				pushRow(key, [
					{ artwork: find(raw.left), large: false },
					{ artwork: find(raw.right), large: false }
				]);
				break;
			case 'layout.three-across':
			case 'layout.three-middle-large':
				pushRow(key, [
					{ artwork: find(raw.left), large: false },
					{ artwork: find(raw.middle), large: raw.__component === 'layout.three-middle-large' },
					{ artwork: find(raw.right), large: false }
				]);
				break;
			case 'layout.full-width': {
				const artwork = find(raw.artwork);
				if (artwork) blocks.push({ kind: 'full-width', key, artwork });
				break;
			}
			case 'layout.four-across':
				pushRow(key, [
					{ artwork: find(raw.first), large: false },
					{ artwork: find(raw.second), large: false },
					{ artwork: find(raw.third), large: false },
					{ artwork: find(raw.fourth), large: false }
				]);
				break;
			case 'layout.single': {
				const artwork = find(raw.artwork);
				if (artwork) blocks.push({ kind: 'single', key, artwork });
				break;
			}
			case 'layout.carousel': {
				const list = (raw.artworks ?? []).map(find).filter((a): a is Artwork => a !== null);
				if (list.length > 0) blocks.push({ kind: 'carousel', key, artworks: list });
				break;
			}
			case 'layout.immersive': {
				const list = (raw.artworks ?? []).map(find).filter((a): a is Artwork => a !== null);
				if (list.length > 0) blocks.push({ kind: 'immersive', key, artworks: list });
				break;
			}
			// Unknown block types (added in Strapi before the frontend supports them) are skipped.
		}
	}

	// Safety net: if the homepage hasn't been built or published yet, show every artwork in
	// rows of three rather than an empty page.
	if (blocks.length === 0) {
		for (let i = 0; i < artworks.length; i += 3) {
			blocks.push({
				kind: 'row',
				key: `fallback-${i}`,
				slots: artworks.slice(i, i + 3).map((artwork) => ({ artwork, large: false }))
			});
		}
	}

	return {
		blocks,
		contactEmail: bio?.email ?? null
	};
};
