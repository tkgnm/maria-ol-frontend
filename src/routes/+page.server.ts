import { getArtworks } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const artworks = await getArtworks(fetch);
	return { artworks };
};
