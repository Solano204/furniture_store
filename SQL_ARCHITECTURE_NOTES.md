# SQL Architecture Notes — furniture_store (Postgres/Prisma layer)

Doc 4 deliverable (the frontend's own Postgres database, independent of the backend's MongoDB - see Doc 5 for that side).

## Real bug found and fixed: admin "delete product" was calling the wrong database

`app/admin/products/page.tsx` fetched its product list via `fetchAdminProducts` from the GraphQL/MongoDB path (already correctly migrated), but its delete button was still wired to `deleteProductAction` imported from `@/app/utils/actions` - the **Prisma/Postgres** version, left over from before the catalog moved to the Spring/Mongo backend. Since the `productId` values on that page come from MongoDB, they essentially never match a row in Postgres's `Product` table, so clicking delete silently failed (or deleted nothing meaningful) while doing nothing to the actual product. Fixed by importing the already-existing GraphQL-based `deleteProductAction` from `Api/Actions/Products.tsx` instead - a one-line import change, no new code needed, the correct implementation was already there and used by `createProductAction`/`updateProductAction` on the neighboring admin pages.

Found this by tracing every `utils/actions` import site: 5 of the 6 files that still reference it have the import **commented out** (several literally tagged `// PRISMA` or `// VERSION 1`) - breadcrumbs from a real, mostly-complete migration off Prisma for catalog data. This one was the one live straggler.

## Dead schema, not touched

`Product`, `Review`, and `Favorite` models still exist in `schema.prisma` and in `actionsInformationDbPrisma.tsx`, but after the fix above, nothing live imports that file anymore (`actions.ts` re-exports it, but nothing imports `actions.ts` either, as far as this pass traced). Recommend confirming with a full unused-export check (not done here - `actions.ts` re-exports 17 functions and tracing every one individually was out of scope for this pass) and then deleting `actionsInformationDbPrisma.tsx`, `actions.ts`, and the 3 Postgres models - keeping unused schema+code that shadows the real (Mongo) source of truth is exactly how the bug above happened in the first place, and it's a trap for the next feature built against this file by habit.

## Indexes fixed this pass

| Model | Column(s) | Query it backs |
|---|---|---|
| `Cart` | `clerkId` | `fetchOrCreateCart` - runs on every cart-touching request |
| `Order` | `clerkId` | `fetchUserOrders` |
| `CartItem` | `cartId` | `cart.cartItems` relation traversal - Postgres/Prisma doesn't auto-index a relation's FK column, only the referenced side's PK |

## Migrations: no history at all

No `prisma/migrations/` directory exists - this project uses `prisma db push` (direct schema sync), not `prisma migrate`. Same category of gap as food-ordering-system's `DROP SCHEMA CASCADE`-on-every-boot init script, though less severe here since `db push` doesn't destroy data on each deploy, it just has no rollback path or change history. Not switching to `prisma migrate dev` in this pass - same reasoning as the Flyway call in food-ordering-system: it's a real behavior/workflow change (a schema drift between your local DB and `schema.prisma` would now block a push instead of silently reconciling) worth adopting deliberately, not as a side effect of an index fix. The 3 index additions above will need `npx prisma db push` (or, if you do adopt migrations first, `npx prisma migrate dev --name add_missing_indexes`) run against a real database to take effect - not run here, no execution in this pass.
