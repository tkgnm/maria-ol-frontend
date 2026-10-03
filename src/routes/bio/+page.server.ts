import { getAwards, getBio, getEvents } from '$lib/api';
import type { Event } from '$lib/types';
import type { PageServerLoad } from './$types';

const byStartDesc = (a: Event, b: Event) => (b.startDate ?? '').localeCompare(a.startDate ?? '');

export const load: PageServerLoad = async ({ fetch }) => {
	const [bio, events, awards] = await Promise.all([
		getBio(fetch),
		getEvents(fetch),
		getAwards(fetch)
	]);
	awards.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
	return {
		bio,
		residenciesAndCourses: events
			.filter((e) => e.category === 'residency' || e.category === 'course')
			.sort(byStartDesc),
		exhibitions: events.filter((e) => e.category === 'exhibition').sort(byStartDesc),
		awards
	};
};
