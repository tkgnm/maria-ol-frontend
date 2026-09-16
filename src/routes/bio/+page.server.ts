import { getBio } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const bio = await getBio(fetch);
	return { bio };
};
