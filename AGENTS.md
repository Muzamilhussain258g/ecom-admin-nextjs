<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# E-Commerce Admin: Agent Instructions

## 1. Purpose and working approach

Implement requested features end to end with readable, reusable, maintainable TypeScript. Inspect relevant code before editing, follow nested AGENTS.md files, preserve unrelated changes, and keep scope focused. Prefer existing patterns and dependencies over new packages. Do not copy incomplete template behavior into production features or claim unverified work is complete.

## 2. Stack and dependency policy

The installed package versions and APIs are authoritative. Read package.json, pnpm-lock.yaml, relevant local types, and existing usage before relying on remembered APIs. Read the installed Next.js guides specified above before writing application code. Do not upgrade dependencies or regenerate configuration as an incidental part of a feature.

| Area | Project dependencies | Usage rule |
| --- | --- | --- |
| Framework | Next.js 16, React 19, React DOM | Follow App Router conventions and installed Next.js documentation. |
| Language | TypeScript 6 | Preserve strict typing and the existing compiler configuration. |
| UI | shadcn, @base-ui/react | Reuse local components in src/components/ui; this project uses the base-nova style, not assumed Radix APIs. |
| Styling | Tailwind CSS 4, @tailwindcss/postcss, PostCSS | Use the CSS-first theme and semantic tokens in src/app/globals.css. |
| Classes and variants | cn, class-variance-authority | Import cn from @/lib/utils; use cva for meaningful component variants. |
| Forms | react-hook-form, zod, @hookform/resolvers | Use typed forms with Zod schemas and zodResolver. |
| Shared state | zustand | Use focused stores for shared client application state. |
| Tables | @tanstack/react-table | Follow installed types and existing table patterns; do not assume an older major version's APIs. |
| Charts | recharts | Reuse the local chart wrappers, configuration, and theme tokens. |
| Drag and drop | @dnd-kit/core, sortable, modifiers, utilities | Reuse existing sensors and sortable patterns for accessible interactions. |
| Dates | date-fns, react-day-picker | Use existing date helpers and calendar wrappers. |
| Icons and commands | lucide-react, cmdk | Use Lucide icons and the existing command component. |
| Resizable layouts | react-resizable-panels | Use the existing resizable wrapper and installed APIs. |
| Animation | tw-animate-css | Prefer existing utility animations; respect reduced motion. |
| Theme dependency | next-themes | Installed, but the root currently uses a custom Context ThemeProvider; preserve that architecture unless migration is requested. |
| Static checks | ESLint 10, eslint-config-next | Follow eslint.config.mjs; do not silence checks to hide defects. |

Installed does not mean active everywhere. Confirm actual usage in the target feature. Do not introduce duplicate form, state, chart, icon, date, or styling libraries for behavior the stack already supports.

## 3. Structure and reusable code

- Use the @/* alias, which resolves to src/*. Follow nearby naming, formatting, and import conventions.
- Keep routes and page composition in src/app, shared UI in src/components, reusable hooks in src/hooks, provider configuration in src/contexts, and shared types in src/types when genuinely shared.
- Follow existing ownership between src/lib, src/utils, and src/config rather than adding duplicate helper layers. Keep feature-specific components, schemas, services, and types near their feature.
- Keep functions and components focused. Extract repeated behavior into reusable components, hooks, utilities, or services; avoid speculative abstractions and one giant global service or store.
- Type props, domain models, API payloads, and responses explicitly. Avoid any and unsafe assertions; narrow unknown at external boundaries. Reuse inferred schema types where appropriate.
- Derive computed values from their source. Avoid duplicated state and effects that merely synchronize copies of data.

## 4. Next.js and rendering boundaries

- Use Server Components where appropriate and Client Components for interactive state, browser APIs, and client hooks. Keep client boundaries as small as practical.
- Keep secrets and privileged operations on the server. Never import server-only modules into client code or expose secrets through public environment variables.
- Follow the installed documentation for routing, navigation, async request APIs, caching, revalidation, images, and metadata. Do not assume older Next.js defaults.
- Avoid browser storage access during server rendering and prevent hydration mismatches. Never share mutable user-specific state across server requests.

## 5. UI, styling, and accessibility

- Inspect src/components/ui and components.json before adding UI. Compose existing primitives instead of rebuilding dialogs, fields, selects, menus, tables, calendars, or toasts.
- Preserve Base UI composition, focus handling, and accessibility behavior. Do not paste incompatible Radix-specific props into Base UI wrappers.
- Use semantic Tailwind theme classes for colors, borders, spacing, and typography, with the existing light/dark tokens. Do not add a legacy Tailwind configuration without a specific need.
- Keep interfaces responsive. Provide semantic elements, associated labels, keyboard support, visible focus, and accessible names for icon-only buttons.
- Use existing toast and feedback patterns. Display loading, empty, success, validation, and error states where applicable. Confirm destructive actions using the established dialog pattern.

## 6. Forms and validation

- Use React Hook Form for form values, touched state, validation integration, and submission state. Use Zod and zodResolver for schemas, following existing signup, settings, and user-dialog examples.
- Use Controller for controlled UI components when required. Reuse existing field, input, select, and error-display components.
- Align schemas and payload conversion with the backend contract. Handle optional values, numeric inputs, dates, and defaults deliberately instead of relying on unsafe casts.
- Show field-level and server errors clearly, disable duplicate submissions, and preserve input after recoverable failures. Reset forms deliberately after success or when switching the edited record.
- Keep form state out of Zustand and Context. Do not generalize incomplete static template forms as the preferred pattern for new working forms.

## 7. State management

- Use Zustand for shared client application state. Reference existing stores in src/app/(dashboard)/chat/use-chat.ts and src/app/(dashboard)/mail/use-mail.ts; reuse a suitable store before creating another.
- Keep stores domain-focused with typed state and actions, immutable updates, and selectors for only the values a component needs. Avoid subscriptions to an entire store unnecessarily.
- Use existing React Context providers for theme and sidebar configuration. Do not duplicate their state in Zustand or add a second theme provider merely because next-themes is installed.
- Keep component-only UI state local. Keep shareable search, pagination, and filters in URL parameters where appropriate.
- Keep API access in services. Do not copy every server response into global state; when shared fetched data is needed, define loading, errors, refreshing, and invalidation explicitly. TanStack Table is not TanStack Query; do not assume a query cache library is installed.
- Persist only necessary non-sensitive preferences. Do not persist passwords, tokens, or sensitive user data through browser-storage middleware. Follow the established session strategy and clear user-specific state on logout or account changes.
- Handle persistence hydration and Next.js server/client boundaries explicitly.

## 8. Tables, charts, dates, and interactions

- Build reusable typed table columns and compose existing pagination, selection, filters, and row actions. Use stable record IDs. Match server pagination and filtering behavior to the actual API.
- For charts, map real data to the existing Recharts wrappers and semantic chart colors; include empty states and useful labels or tooltips. Never substitute invented business metrics.
- For drag and drop, use stable IDs, appropriate sensors, keyboard support, and existing dnd-kit patterns. Persist reordered data only when the API supports it and handle failed saves visibly.
- Use date-fns and existing calendar components for date operations. Keep transport dates distinct from display formatting, clarify timezone assumptions, and do not silently shift date-only values.
- Reuse command and resizable wrappers instead of creating competing implementations.

## 9. Backend API integration and authentication

- Read the relevant requests in postmanCollections/ecom-nestjs-backend.json before implementing an integration. Treat it as the available backend contract reference.
- Match HTTP methods, paths, query parameters, headers, authentication, and bodies. Never invent endpoints, response fields, permissions, or backend capabilities.
- Examples may not fully describe response or error shapes. Verify through available backend types, documentation, or authorized API responses; identify missing contract details instead of hiding assumptions.
- Configure the API base URL through environment variables and document required variable names without committing secrets. Do not hardcode the temporary ngrok hostname into application modules.
- Reuse or establish a shared API client for base URL resolution, headers, parsing, and consistent errors. Keep feature-specific requests in services instead of scattering fetch calls across components.
- Handle non-success responses, empty bodies, and documented response formats deliberately. Do not log credentials, tokens, or sensitive payloads.
- Follow documented admin, seller, and customer authentication without mixing roles or tokens. UI visibility is not authorization; preserve server-side access enforcement.
- Follow the established session strategy. Refresh tokens only when supported by the backend, prevent infinite retry loops, and handle expired sessions consistently.
- Implement pagination, search, sorting, and filters according to the API. Filtering one fetched page does not search the entire dataset.
- Use mocks only when requested or explicitly identified as temporary development data. Never silently return mock results after API failures.
- Postman CLI is available for authorized API verification. Inspect requests before running them; do not run a whole live collection that may create, update, or delete data outside the requested scope.

## 10. Tooling and verification

Use pnpm consistently with the checked-in pnpm-lock.yaml. Do not introduce package-lock.json or yarn.lock. Inspect scripts before running them; currently available commands are:

| Command | Purpose |
| --- | --- |
| pnpm dev | Start the development server. |
| pnpm lint | Run ESLint. |
| pnpm exec tsc --noEmit | Check TypeScript without emitting application files. |
| pnpm build | Create a production build. |
| pnpm start | Run an already built production application. |

- Run checks appropriate to the change. For application changes, run lint and type checks, and build when rendering, routing, configuration, or integration changes warrant it. Documentation-only edits need content verification rather than an application build.
- There is currently no test script in package.json. Do not claim tests ran or invent an existing test suite. Run meaningful available tests when present; add tests for consequential behavior when useful, avoiding tests that merely mirror implementation.
- For UI changes, verify affected interactions and responsive behavior when a browser is available. Report any verification limitation.
- Review changed files for unrelated edits, duplicated logic, exposed secrets, incomplete placeholders, and regressions. Do not edit generated files in node_modules or .next as implementation fixes.
- Finish with a concise report of changes, checks actually run, and remaining blockers. Distinguish existing failures from failures introduced by the change.
