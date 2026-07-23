FURNITURE STORE — Hexagonal GraphQL Backend + Next.js Storefront

**Hexagonal GraphQL Backend**: I designed a Spring Boot 3.3 backend (Java 21, reactive MongoDB) around ports-and-adapters: application-layer ports define the use cases, and driver adapters (GraphQL resolvers, still named `*Controller` for consistency) and driven adapters (Mongo repositories) plug into them independently. GraphQL is the entire API surface - there are no separate REST endpoints.

**JWT Auth with Field-Level GraphQL Security**: I implemented a full JWT auth flow (login, refresh, logout, token revocation) behind a `GraphQlSecurityInterceptor` that parses each incoming document with graphql-java to resolve the actual requested operation name(s) - not a substring search over the raw query text - before deciding whether a request is public, requires any authenticated user, or requires `ROLE_ADMIN` (catalog management, the all-users order list). An `OwnershipGuard` additionally cross-checks every client-supplied `clerkId` argument against the authenticated caller, so one user's token can't be used to read or mutate another user's favorites/orders/reviews.

**Next.js Storefront with GraphQL + Clerk**: I built the customer-facing storefront in Next.js 15 (React 19) using Apollo Client against the backend's GraphQL API, Clerk for session management, and Redux Toolkit for client-side cart state, with a component library built on Radix UI primitives.

**Domain Coverage**: Product catalog with reviews, favorites, and order history — reviews and favorites are tied to the authenticated user, and orders carry the cart snapshot at time of purchase.

Technologies: Java 21 (Spring Boot 3.3, Spring WebFlux, Spring Security, GraphQL Java), MongoDB (reactive driver), Next.js 15 / React 19 / TypeScript, Apollo Client, Clerk, Redux Toolkit, Prisma/PostgreSQL, Radix UI + Tailwind CSS.

*Note: the frontend uses a mixed-persistence setup — product/review/favorite data comes from the Spring GraphQL backend via Apollo Client, while cart and order state is persisted separately through Prisma/PostgreSQL (`app/utils/cartActionPrisma.tsx`, `orderActionBase.tsx`, consumed by `CartItemsList`/`CartTotals`/`ProductsGrid`). Also, Clerk is wired up for its React components but session validation itself runs through a custom cookie system (`middleware.ts`), not Clerk's own auth.*
