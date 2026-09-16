/** True for our "year-only precision" convention: an ISO date padded to Jan 1st. */
function isYearOnly(iso: string): boolean {
	return /-01-01$/.test(iso);
}

/** Format a single ISO date as "Month Year", or just "Year" when only the year is known. */
export function formatMonthYear(iso: string): string {
	const d = new Date(iso);
	if (isYearOnly(iso)) {
		return d.toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' });
	}
	return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Format an event's start/end date range for display. */
export function formatEventDate(startDate: string | null, endDate: string | null): string {
	if (!startDate) return '';
	const startMonthYear = formatMonthYear(startDate);

	if (!endDate || endDate === startDate) {
		return startMonthYear;
	}

	if (isYearOnly(startDate) || isYearOnly(endDate)) {
		const endMonthYear = formatMonthYear(endDate);
		return endMonthYear === startMonthYear ? startMonthYear : `${startMonthYear} – ${endMonthYear}`;
	}

	const start = new Date(startDate);
	const end = new Date(endDate);
	const startDay = start.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' });
	const sameMonth =
		start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear();
	if (sameMonth) {
		const endDay = end.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' });
		return `${startDay}–${endDay} ${startMonthYear}`;
	}

	return `${startMonthYear} – ${formatMonthYear(endDate)}`;
}
