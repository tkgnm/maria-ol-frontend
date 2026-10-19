# maria-ol-frontend

## Developing against a local backend

By default the site fetches from the prod backend (`https://maria-ol-backend.fly.dev`). To test frontend and backend changes together, point it at a local Strapi.

1. Get a local Strapi running with a copy of prod data, and create a local read-only API token. See the [backend README](https://github.com/tkgnm/maria-ol-backend#-local-development-with-prod-data).
2. Create `.env.local` in this repo (it's gitignored and overrides `.env`):

   ```
   PUBLIC_BACKEND_URL=http://localhost:1337
   API_KEY=<the token from your LOCAL Strapi admin>
   ```

   - `PUBLIC_BACKEND_URL` is the server root, without `/admin` or `/api`.
   - Use a token from the **local** admin. The prod token (`.env`, or `npm run secrets:pull`) won't work against a local database.
   - To go back to prod, remove those two lines from `.env.local`.

3. Start the dev server, and **restart it after changing any `.env` file**:

   ```sh
   npm run dev
   ```

4. Before pushing, run a production build, because the site is prerendered and some things (such as the hero nav overlay) are decided at build time:

   ```sh
   npm run build && npm run preview
   ```

The backend must be deployed before the frontend whenever a change adds or renames Strapi fields, otherwise the Vercel build fails on the new request.
