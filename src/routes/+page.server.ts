import { getArtworkGroups, getArtworks } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const [artworks, groups] = await Promise.all([getArtworks(fetch), getArtworkGroups(fetch)]);

	// Manual homepage order: sortOrder first (nulls last), then oldest-first as today.
	artworks.sort((a, b) => {
		if (a.sortOrder != null && b.sortOrder != null) return a.sortOrder - b.sortOrder;
		if (a.sortOrder != null) return -1;
		if (b.sortOrder != null) return 1;
		return a.createdAt.localeCompare(b.createdAt);
	});

	return { artworks, groups };
};
