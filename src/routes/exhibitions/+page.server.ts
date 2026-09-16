import { getEvents } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const events = await getEvents(fetch);
	const shows = events
		.filter((e) => e.category === 'exhibition' || e.category === 'residency')
		.sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));
	return { events: shows };
};
