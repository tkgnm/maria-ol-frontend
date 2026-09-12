import { API_KEY } from '$env/static/private';
import type { Artwork, StrapiCollectionResponse } from '$lib/types';
import { BACKEND_URL } from '$lib/media';

/**
 * Fetch all published artworks, ordered.
 * Pass the SvelteKit `fetch` so it works during SSR.
 */
export async function getArtworks(fetchFn: typeof fetch): Promise<Artwork[]> {
	const url = new URL('/api/artworks', BACKEND_URL);
	url.searchParams.set('populate', '*');
	// Order deterministically by creation date (oldest first).
	url.searchParams.set('sort', 'createdAt:asc');
	url.searchParams.set('pagination[pageSize]', '100');

	const res = await fetchFn(url, {
		headers: {
			Authorization: `Bearer ${API_KEY}`
		}
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch artworks: ${res.status} ${res.statusText}`);
	}

	const json = (await res.json()) as StrapiCollectionResponse<Artwork>;
	return json.data;
}
