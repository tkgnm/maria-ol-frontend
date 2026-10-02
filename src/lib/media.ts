import { env } from '$env/dynamic/public';
import type { StrapiMedia } from '$lib/types';

/** Set PUBLIC_BACKEND_URL (e.g. http://localhost:1337) to develop against a local Strapi. */
export const BACKEND_URL = env.PUBLIC_BACKEND_URL || 'https://maria-ol-backend.fly.dev';

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

/** Largest available display URL for a media item (absolute), for full-size viewing. */
export function largeMediaUrl(media: StrapiMedia | null | undefined): string | null {
	if (!media) return null;
	return resolveMediaUrl(media.formats?.large?.url ?? media.url);
}

/** Small display URL for a media item (absolute), for thumbnails. */
export function thumbMediaUrl(media: StrapiMedia | null | undefined): string | null {
	if (!media) return null;
	return resolveMediaUrl(media.formats?.thumbnail?.url ?? media.url);
}
