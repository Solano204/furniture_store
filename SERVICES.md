# Furniture Store — Service Descriptions

## backend (Spring Boot 3.3, Java 21)
Hexagonal architecture under `com.backend`: `Aplication/Ports` defines the driver-side use-case contracts; `Infraestructure/Adapters/Drivers` implements the inbound side (REST controllers + GraphQL security interceptor); `Infraestructure/Adapters/Drivens` implements the outbound side (MongoDB entities/repositories, GraphQL schema resolvers). Reactive MongoDB (`spring-boot-starter-data-mongodb-reactive`).

Controllers/entities: `AuthenticationController` (JWT login/refresh/logout), `UserController`, `ProductController`, `OrderController`, `ReviewController`, `FavoriteController`. Same domain is also exposed through `graphql/schema.graphqls`, guarded by `GraphQlSecurityInterceptor` for field-level role checks (`Role`/`UserRole`).

## frontend (Next.js 15, React 19)
Storefront UI. Talks to the backend through `app/utils/Api/Queries` (GraphQL reads via Apollo Client) and `app/utils/Api/Actions` (mutations — favorites, orders, products, reviews, auth). Session/auth validation runs through a custom cookie system (`middleware.ts`, `cookies-session.tsx`) — Clerk is still wired in for its React components/user management but is not what enforces the session. Redux Toolkit holds cart UI state. UI components built on Radix UI + Tailwind, with `embla-carousel` for product carousels and `react-share` for social sharing.

Ships a `prisma/schema.prisma` (Postgres: `Product`, `Cart`, `CartItem`, `Review`) that IS actively used — `app/utils/cartActionPrisma.tsx` and `orderActionBase.tsx` persist cart/order state through it, consumed by `CartItemsList`, `CartTotals`, and `ProductsGrid`/`ProductsList`. So the app runs on two data layers: MongoDB/GraphQL for products/reviews/favorites/auth, Postgres/Prisma for cart/orders. There's also a dead alternative cart implementation, `cartActionsLocal.tsx`, not wired into anything — candidate for removal.
