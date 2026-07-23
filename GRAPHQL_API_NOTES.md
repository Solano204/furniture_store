# GraphQL API Review — furniture_store

Doc 1 deliverable (adapted from the REST design doc - this backend is GraphQL-only, so HTTP-verb/status-code/HATEOAS phases don't translate; the equivalents that do are covered below).

## Fixed

- **CRITICAL - internal error leak**: `CustomGraphQLExceptionResolver`'s fallback branch returned `"An unexpected error occurred: " + ex.getMessage()` straight to the client for every unclassified exception - a Mongo driver error, an NPE with an internal field name, anything. Now logs the full exception server-side and returns a generic message + `errorCode: INTERNAL_ERROR`, matching the shape `GraphQLCustomException` already used.
- **Money precision**: `orderTotal`/`tax`/`shipping` were typed `Float!` in the schema (explicitly downgraded from `BigDecimal!`, per the code comments that were there) even though the Java-side records already correctly use `BigDecimal`. `Float` round-trips through a binary double at the GraphQL layer, which risks baking in values like `19.990000000000002` at the exact point a mutation input gets parsed. Added a custom `BigDecimal` scalar (`BigDecimalScalar.java`, built on graphql-java's core `Coercing` API already on the classpath - not the third-party `graphql-java-extended-scalars` library, since I can't verify its version compatibility with this project's bundled graphql-java without network access) and changed the schema to use it. Confirmed backward-compatible with the frontend: Apollo Client sends these as plain untyped JSON numbers in its `variables` object either way, so nothing on the frontend needed to change.
- **Dead actuator config**: `application.properties` already configured `management.endpoints.web.exposure.include` - the starter dependency just wasn't there, so it was a silent no-op. Added it (also needed for Doc 2's healthcheck and Doc 7's tracing).

## Confirmed already correct (verified, not assumed)

- `getOrders` (returns every user's orders) is correctly listed in `graphql.admin-operations` - the admin gate is real, not just documented in a comment.
- `OwnershipGuard.verifyOwnClerkId` is wired into both `createOrder` and `getUserOrders`, so one user's token can't read/mutate another user's data.
- `GraphQlSecurityInterceptor` resolves the actual requested operation via `graphql-java`'s parser (not a substring search) and fails closed on anything ambiguous (a fragment spread at the operation root, an unparseable document) - already hardened against the classic "hide a protected field behind a comment" trick.

## Flagged, not fixed this pass

- **No pagination on any list query** (`getFeaturedProducts`, `searchProducts`, `getProductReviews`, `getUserOrders`, `getOrders`, `getUserReviews`, `getFavorites` all return a raw `[Type]`). Not fixing now: moving to cursor-based pagination changes the return shape of 7 queries, which means updating every corresponding Apollo call in the frontend in the same change - a real, coordinated, multi-file migration, not a schema tweak. Worth doing deliberately, starting with whichever of these returns the largest lists in practice (`searchProducts` is the obvious candidate - full-catalog scans have no natural cap today).
- **No idempotency key on `createOrder`**: same class of gap as `POST /orders` in the food-ordering-system audit - a dropped connection during checkout could double-submit. Deferring for the same reason pagination is deferred: the fix (a dedup mechanism keyed by a client-supplied token, checked before the Mongo write) is real work, not a config change, and this project's `createOrder` doesn't yet have the transactional-outbox-style infrastructure food-ordering already had to hang it off - it would be built from scratch here.
