import type { StrapiMedia } from '$lib/types';

export const BACKEND_URL = 'https://maria-ol-backend.fly.dev';

/** Strapi's local upload provider returns relative URLs; make them absolute. */
export function resolveMediaUrl(url: string | undefined | null): string | null {
	if (!url) return null;
	return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
}

/** Pick a reasonable display URL for a media item (absolute). */
export function mediaUrl(media: StrapiMedia | null | undefined): string | null {
	if (!media) return null;
	return resolveMediaUrl(media.formats?.medium?.url ?? media.url);
}
