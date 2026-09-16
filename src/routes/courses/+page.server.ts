import { getEvents } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const events = await getEvents(fetch);
	const courses = events
		.filter((e) => e.category === 'course')
		.sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));
	return { events: courses };
};
