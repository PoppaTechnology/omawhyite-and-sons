# Oma & Sons Storefront Frontend

React storefront frontend for Oma & Sons. It connects catalogue browsing, product details, authentication, wishlist, cart, checkout, and Paystack payment initialization to the existing Django REST API backend.

## What's included

The app has Home, Shop, Product Detail, Cart, Checkout, Order Confirmation, Login, Sign Up, and Wishlist pages. Product listing, filtering, sorting, product detail, variants, prices, stock, and product images are all read live from the API.

On a product card, the cart button and the card's own navigation are separate actions: products with multiple variants open the Product Detail page for size/variant selection, while single-variant products can be added directly from the card. Wishlist hearts are inactive for guests and become active once signed in. Authentication tokens are stored in `sessionStorage`, not cookies.

If the backend is unreachable (for example, a CORS rejection during local preview against the deployed API), the app falls back to a locked 16-product local catalogue for read-only display. This fallback exists purely so the UI has something to show — it is not a substitute data source, and cart/checkout/account actions still require the real API.

## Stack

React 19, Vite 7, Wouter for routing, Tailwind CSS 4, lucide-react icons. No backend code lives in this repository — the frontend only talks to the existing Django API over HTTP.

## Getting started

Requires Node.js 20+ and npm (bundled with Node). This project uses npm, not pnpm or yarn — `npm install` is the supported install path.

```bash
npm install
npm run dev
```

`npm install` triggers a `postinstall` step (`patch-package`) that applies one small, tracked patch to the `wouter` package — see [Dependency patch](#dependency-patch) below. This is normal and expected; you don't need to do anything extra.

Open the local Vite URL printed in the terminal (typically `http://localhost:3000`).

For a production build and local preview of that build:

```bash
npm run build
npm run preview
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Build the frontend and the small production static-file server bundle. |
| `npm run preview` | Serve the production build locally for a final check. |
| `npm run check` | Run `tsc --noEmit` as a type/config sanity check. |
| `npm run format` | Format the project with Prettier. |

## Pointing at a different backend

By default the app talks to:

```text
https://oma-and-sons-backend.vercel.app
```

To use a different backend (e.g. local Django on `localhost:8000`), create a `.env.local` file in the project root:

```env
VITE_API_ORIGIN=https://your-api-domain.example.com
```

Set the origin only — no trailing `/api` and no path. The app appends its own paths (`/api/products/`, `/api/accounts/login/`, `/media/products/<file>`, etc.) via `client/src/lib/api.js`. This project doesn't ship a `.env.example`; `.env.local` is read directly by Vite and is already covered by `.gitignore`.

## How the frontend talks to the backend

All requests go through `client/src/lib/api.js`, which is the single place that knows API paths, attaches the `Authorization: Token <token>` header, and handles the guest-cart session header. The app does not invent its own endpoints or data shapes — it consumes the backend's existing accounts, products, cart, orders, and payments routes as-is.

Auth token: stored in `sessionStorage` under `oma_auth_token`, sent as `Authorization: Token <token>` on every authenticated request. On page load, the app checks for a stored token and re-fetches the profile to restore session state; a `401` response clears the token and shows a "session expired" notice.

Guest cart: identified by an `X-Cart-Session` value the backend returns and the frontend echoes back on subsequent requests, stored under `oma_cart_session` in `sessionStorage`. Guest carts are not merged into a user's cart on login — the frontend follows whatever the backend does here rather than adding its own merge logic.

## Known quirk: two `App` files

`client/src/App.jsx` is the real one — `client/src/main.jsx` imports it explicitly (`import App from "./App.jsx"`), and it wires up the actual API-backed pages (`StorefrontProvider`, `CheckoutPage`, `LoginPage`, etc.). `client/src/App.tsx` is leftover scaffold code that mounts an older mock UI with no backend calls; it is not imported from anywhere and is dead code. The same duplication exists for `Home.tsx`/`HomePage.jsx`. If you're navigating the codebase, `App.jsx` and `HomePage.jsx` are the ones that matter — the `.tsx` counterparts can be safely ignored (or removed later, as a separate cleanup).

## Dependency patch

`wouter` (the router) ships with one small, tracked patch: `patches/wouter+3.11.0.patch`, applied automatically via the `postinstall` script through [`patch-package`](https://github.com/ds300/patch-package). The patch adds a few lines to `wouter`'s `<Switch>` component (in `src/index.js`) that record known route paths onto `window.__WOUTER_ROUTES__`; nothing in this app's own code currently reads that global, but the patch is preserved since it was part of the original working setup.

The patch filename is pinned to the exact `wouter` version currently resolved (`3.11.0`) under the `^3.3.5` dependency range. If a future `npm install` resolves a newer `wouter` version, `patch-package` will fail loudly rather than silently apply the patch to the wrong version, and will report both the version the patch was made for and the version actually installed. If that happens: edit the newly-installed `node_modules/wouter/src/index.js` to re-add the same block (find the equivalent spot in the current `Switch` component — the insertion point may shift slightly between versions), delete the old `.patch` file, then run `npx patch-package wouter` to regenerate it from the real, current source.

There's also one dependency override in `package.json`: `tailwindcss`'s internal use of `nanoid` is pinned to `3.3.7` (independent of the app's own direct `nanoid` dependency, which stays on its normal version).

## Vendored dependency: `@builder.io/vite-plugin-jsx-loc`

`vite.config.ts` uses `@builder.io/vite-plugin-jsx-loc`, but the package's only published release (`0.1.1`) declares `peerDependencies: { "vite": "^4.0.0 || ^5.0.0" }`, which conflicts with this project's Vite 7 and fails `npm install` with an unresolvable ERESOLVE error. There's no newer version to upgrade to, and the plugin's own manifest can't be corrected via `overrides` (npm's `overrides` field can only change which version of a dependency installs, not rewrite a dependency's own declared peer range).

The fix: `vendor/vite-plugin-jsx-loc/` is a local copy of the real, working package (its actual compiled `dist/` output, copied unchanged) with only its `package.json`'s `peerDependencies.vite` widened to include `^7.0.0`. The root `package.json` points at it via `"@builder.io/vite-plugin-jsx-loc": "file:vendor/vite-plugin-jsx-loc"` instead of the registry version. This is a local override of one field in one manifest — the plugin's actual code and behavior are unchanged, and `vite.config.ts` needs no changes since the import path and export name are identical.

## Deploying elsewhere

This is a normal static Vite build — `npm run build` outputs to `dist/public`, deployable to any static host or the bundled `dist/index.js` Express server (`npm start`) for a simple Node host. Set `VITE_API_ORIGIN` as an environment variable at build time if you're not using the default backend. Configure your host's SPA fallback/history rewrites so client-side routes like `/shop` and `/product/<slug>` resolve to `index.html` instead of 404ing.

Local homepage/category images live in `client/public/assets/` and can be swapped out by filename, or repointed via `client/src/data/assets.js`. Live product images always come from the backend's media origin when the API is reachable — the bundled assets are only used by the offline fallback catalogue described above.

## Backend expectations

The backend needs to allow this frontend's origin via CORS, and (for local development against the deployed API) allow whatever origin your dev server runs on. Write operations — registration, login, cart changes, checkout, payment initialization — will fail if the backend's CORS configuration doesn't include your origin, independent of anything in this frontend.

## Key files

| File | Responsibility |
| --- | --- |
| `client/src/lib/api.js` | API origin, all HTTP requests, token/cart-session storage, error handling. |
| `client/src/state/StorefrontContext.jsx` | Global auth, cart, wishlist, checkout, and order state. |
| `client/src/App.jsx` | Real route table (see the App-file note above). |
| `client/src/pages/ShopPage.jsx` | Product listing, filters, sorting. |
| `client/src/pages/ProductDetailPage.jsx` | Product detail, variant selection, add-to-cart. |
| `client/src/pages/CheckoutPage.jsx` | Checkout form, order totals, Paystack redirect. |
| `client/src/components/catalogue/ProductCard.jsx` | Shared product card UI across listing pages. |
| `client/src/components/layout/SiteChrome.jsx` | Shared header/footer/nav chrome. |
| `client/src/data/products.js` | The offline fallback catalogue (16 products) — not the live data source. |

## Scope

This repository is frontend-only: no Django code, database, migrations, product media originals, API secrets, or Paystack credentials live here. Never commit real API keys or tokens into `.env.local` or the repo.
