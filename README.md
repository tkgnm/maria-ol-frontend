# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.17.0 create --template minimal --types ts --add prettier eslint --install npm maria-ol-frontend
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

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

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
