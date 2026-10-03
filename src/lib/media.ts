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
	return resolveMediaUrl(media.formats?.xlarge?.url ?? media.formats?.large?.url ?? media.url);
}

/**
 * `srcset` of every generated size (thumbnail excluded) so the browser can pick the
 * smallest one that looks sharp. Undefined when there's nothing to choose between;
 * pair with a `sizes` attribute describing how wide the image is displayed.
 */
export function mediaSrcset(media: StrapiMedia | null | undefined): string | undefined {
	if (!media?.formats) return undefined;
	const candidates = Object.entries(media.formats)
		.filter(([name, f]) => name !== 'thumbnail' && f?.url && f.width)
		.map(([, f]) => f)
		.sort((a, b) => a.width - b.width);
	if (candidates.length < 2) return undefined;
	return candidates.map((f) => `${resolveMediaUrl(f.url)} ${f.width}w`).join(', ');
}

/** Small display URL for a media item (absolute), for thumbnails. */
export function thumbMediaUrl(media: StrapiMedia | null | undefined): string | null {
	if (!media) return null;
	return resolveMediaUrl(media.formats?.thumbnail?.url ?? media.url);
}
