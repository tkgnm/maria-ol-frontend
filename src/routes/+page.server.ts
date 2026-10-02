import { getArtworkGroups, getArtworks, getBio } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const [artworks, groups, bio] = await Promise.all([
		getArtworks(fetch),
		getArtworkGroups(fetch),
		getBio(fetch)
	]);

	// Manual homepage order: sortOrder first (nulls last), then oldest-first as today.
	artworks.sort((a, b) => {
		if (a.sortOrder != null && b.sortOrder != null) return a.sortOrder - b.sortOrder;
		if (a.sortOrder != null) return -1;
		if (b.sortOrder != null) return 1;
		return a.createdAt.localeCompare(b.createdAt);
	});

	// A hero group only takes effect when it is the first group on the page (the first group
	// that has artworks); otherwise it falls back to a normal grid. Decided here, ignoring the
	// client-side filters, so the layout can style the nav in the prerendered HTML.
	const firstGroup = groups.find((g) =>
		artworks.some((a) => a.groups.some((ag) => ag.documentId === g.documentId))
	);
	const heroGroup = firstGroup?.displayMode === 'hero' ? firstGroup : null;
	const heroArtwork = heroGroup
		? (artworks.find(
				(a) => a.coverImage && a.groups.some((ag) => ag.documentId === heroGroup.documentId)
			) ?? null)
		: null;

	return {
		artworks,
		groups,
		contactEmail: bio?.email ?? null,
		hero:
			heroArtwork && heroGroup ? { groupId: heroGroup.documentId, artworkId: heroArtwork.id } : null
	};
};
