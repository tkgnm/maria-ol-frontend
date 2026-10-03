// Switch the dev server between the prod and local Strapi backends.
//
//   npm run backend:prod    # use prod (parks .env.local as .env.local.off)
//   npm run backend:local   # use local (restores .env.local.off)
//   npm run backend:status  # show which one is active
//
// Restart `npm run dev` after switching; Vite only reads .env files at startup.
import { existsSync, renameSync } from 'node:fs';

const ACTIVE = '.env.local';
const PARKED = '.env.local.off';
const mode = process.argv[2];

if (mode === 'prod') {
	if (existsSync(ACTIVE)) renameSync(ACTIVE, PARKED);
	console.log('Backend: prod. Restart the dev server.');
} else if (mode === 'local') {
	if (existsSync(PARKED) && !existsSync(ACTIVE)) renameSync(PARKED, ACTIVE);
	if (existsSync(ACTIVE)) console.log('Backend: local. Restart the dev server.');
	else {
		console.error(`No ${PARKED} to restore. See the README for creating ${ACTIVE}.`);
		process.exit(1);
	}
} else if (mode === 'status') {
	console.log(`Backend: ${existsSync(ACTIVE) ? 'local (.env.local present)' : 'prod'}`);
} else {
	console.error('Usage: node scripts/backend.mjs <prod|local|status>');
	process.exit(1);
}
