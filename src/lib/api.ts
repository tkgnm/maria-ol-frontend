import { API_KEY } from '$env/static/private';
import type {
	Artwork,
	ArtworkGroup,
	Award,
	Bio,
	Event,
	StrapiCollectionResponse,
	StrapiSingleResponse,
	Tag
} from '$lib/types';
import { BACKEND_URL } from '$lib/media';

/** HTTP status codes worth retrying (rate limit + gateway/cold-start errors). */
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

interface RetryOptions {
	/** Maximum number of retries after the initial attempt. */
	retries: number;
	/** Base backoff delay in milliseconds. */
	baseMs: number;
	/** Maximum backoff delay in milliseconds. */
	capMs: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
	retries: 6,
	baseMs: 1000,
	capMs: 8000
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch with exponential backoff + jitter.
 *
 * The backend runs on Fly.io with `min_machines_running = 0`, so it auto-stops
 * when idle and takes ~15–20s to cold-start. During that window Fly's proxy
 * returns 429/502/503/504 or refuses the connection. Since this site is
 * prerendered, these calls happen at build time, so retrying keeps `vite build`
 * from failing against a sleeping backend.
 *
 * Retries on retryable HTTP statuses AND on thrown network errors
 * (connection refused/reset). Pass the SvelteKit `fetch` through so it works
 * during SSR/prerender.
 */
async function fetchWithRetry(
	fetchFn: typeof fetch,
	input: URL | RequestInfo,
	init?: RequestInit,
	opts: RetryOptions = DEFAULT_RETRY_OPTIONS
): Promise<Response> {
	let lastError: unknown;

	for (let attempt = 0; attempt <= opts.retries; attempt++) {
		try {
			const res = await fetchFn(input, init);
			if (!RETRYABLE_STATUSES.has(res.status) || attempt === opts.retries) {
				return res;
			}
			lastError = new Error(`Retryable HTTP status ${res.status}`);
		} catch (err) {
			// Network-level failure (connection refused/reset while the machine boots).
			lastError = err;
			if (attempt === opts.retries) {
				throw err;
			}
		}

		// Exponential backoff with full jitter.
		const backoff = Math.min(opts.capMs, opts.baseMs * 2 ** attempt);
		const delay = Math.random() * backoff;
		await sleep(delay);
	}

	// Unreachable in practice, but keeps TypeScript satisfied.
	throw lastError instanceof Error ? lastError : new Error('fetchWithRetry: exhausted retries');
}

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

	const res = await fetchWithRetry(fetchFn, url, {
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

function authedFetch(fetchFn: typeof fetch, path: string, params?: Record<string, string>) {
	const url = new URL(path, BACKEND_URL);
	for (const [key, value] of Object.entries(params ?? {})) {
		url.searchParams.set(key, value);
	}
	return fetchWithRetry(fetchFn, url, {
		headers: {
			Authorization: `Bearer ${API_KEY}`
		}
	});
}

/** Fetch all events (exhibitions, residencies, courses), oldest first. */
export async function getEvents(fetchFn: typeof fetch): Promise<Event[]> {
	const res = await authedFetch(fetchFn, '/api/events', {
		sort: 'startDate:asc',
		'pagination[pageSize]': '100'
	});
	if (!res.ok) throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
	const json = (await res.json()) as StrapiCollectionResponse<Event>;
	return json.data;
}

/** Fetch all awards, oldest first. */
export async function getAwards(fetchFn: typeof fetch): Promise<Award[]> {
	const res = await authedFetch(fetchFn, '/api/awards', {
		sort: 'date:asc',
		'pagination[pageSize]': '100'
	});
	if (!res.ok) throw new Error(`Failed to fetch awards: ${res.status} ${res.statusText}`);
	const json = (await res.json()) as StrapiCollectionResponse<Award>;
	return json.data;
}

/** Fetch the single bio entry. Returns null if it hasn't been created yet. */
export async function getBio(fetchFn: typeof fetch): Promise<Bio | null> {
	const res = await authedFetch(fetchFn, '/api/bio', { populate: '*' });
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`Failed to fetch bio: ${res.status} ${res.statusText}`);
	const json = (await res.json()) as StrapiSingleResponse<Bio>;
	return json.data;
}

/** Fetch all artwork groups, in manual sort order. */
export async function getArtworkGroups(fetchFn: typeof fetch): Promise<ArtworkGroup[]> {
	const res = await authedFetch(fetchFn, '/api/artwork-groups', {
		sort: 'sortOrder:asc',
		'pagination[pageSize]': '100'
	});
	if (!res.ok) throw new Error(`Failed to fetch artwork groups: ${res.status} ${res.statusText}`);
	const json = (await res.json()) as StrapiCollectionResponse<ArtworkGroup>;
	return json.data;
}

/** Fetch all tags. */
export async function getTags(fetchFn: typeof fetch): Promise<Tag[]> {
	const res = await authedFetch(fetchFn, '/api/tags', {
		sort: 'name:asc',
		'pagination[pageSize]': '100'
	});
	if (!res.ok) throw new Error(`Failed to fetch tags: ${res.status} ${res.statusText}`);
	const json = (await res.json()) as StrapiCollectionResponse<Tag>;
	return json.data;
}
