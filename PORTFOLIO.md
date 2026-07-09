FURNITURE STORE — Hexagonal GraphQL Backend + Next.js Storefront

**Hexagonal GraphQL/REST Backend**: I designed a Spring Boot 3.3 backend (Java 21, reactive MongoDB) around ports-and-adapters: application-layer ports define the use cases, and driver adapters (REST controllers + a GraphQL API) and driven adapters (Mongo repositories) plug into them independently — so the same product/order/review/favorite logic is reachable through both REST and GraphQL without duplicating business rules.

**JWT Auth with Role-Based GraphQL Security**: I implemented a full JWT auth flow (login, refresh, logout, token revocation) with a `GraphQlSecurityInterceptor` enforcing role checks per-field, not just per-endpoint, so GraphQL queries/mutations respect the same authorization rules as the REST controllers.

**Next.js Storefront with GraphQL + Clerk**: I built the customer-facing storefront in Next.js 15 (React 19) using Apollo Client against the backend's GraphQL API, Clerk for session management, and Redux Toolkit for client-side cart state, with a component library built on Radix UI primitives.

**Domain Coverage**: Product catalog with reviews, favorites, and order history — reviews and favorites are tied to the authenticated user, and orders carry the cart snapshot at time of purchase.

Technologies: Java 21 (Spring Boot 3.3, Spring WebFlux, Spring Security, GraphQL Java), MongoDB (reactive driver), Next.js 15 / React 19 / TypeScript, Apollo Client, Clerk, Redux Toolkit, Prisma/PostgreSQL, Radix UI + Tailwind CSS.

*Note: the frontend uses a mixed-persistence setup — product/review/favorite data comes from the Spring GraphQL backend via Apollo Client, while cart and order state is persisted separately through Prisma/PostgreSQL (`app/utils/cartActionPrisma.tsx`, `orderActionBase.tsx`, consumed by `CartItemsList`/`CartTotals`/`ProductsGrid`). Also, Clerk is wired up for its React components but session validation itself runs through a custom cookie system (`middleware.ts`), not Clerk's own auth.*
