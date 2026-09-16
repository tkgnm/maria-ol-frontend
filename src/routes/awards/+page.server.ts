import { getAwards } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const awards = await getAwards(fetch);
	awards.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
	return { awards };
};
