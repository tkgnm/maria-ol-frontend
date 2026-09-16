import { getEvents } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const events = await getEvents(fetch);
	const todayIso = new Date().toISOString().slice(0, 10);
	const upcoming = events
		.filter((e) => e.startDate && e.startDate >= todayIso)
		.sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''));
	return { events: upcoming };
};
