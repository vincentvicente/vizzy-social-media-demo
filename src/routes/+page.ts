import type { PageLoad } from './$types';

/**
 * Surfaces an OAuth connect failure passed back by a platform callback, e.g.
 * /?connect_error=access_denied&error_description=...&platform=tiktok
 *
 * Read in `load` (not onMount) so the right panel renders its error banner +
 * onboarding guide on first paint, including under SSR.
 */
export const load: PageLoad = ({ url }) => {
	const err = url.searchParams.get('connect_error');
	if (!err) {
		return { connectError: null, errorPlatform: null, errorMessage: null };
	}
	const desc = url.searchParams.get('error_description') ?? '';
	return {
		connectError: err,
		errorPlatform: url.searchParams.get('platform'),
		errorMessage: desc ? `${err}: ${desc}` : err
	};
};
