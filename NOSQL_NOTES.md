# NoSQL Modeling Notes — furniture_store (MongoDB backend)

Doc 5 deliverable.

## Modeling: already correct

`Review`/`Favorite` reference `Product` by `productId` string + a `@Transient` field populated manually by the service layer (application-level join), not embedded - the right call here since products, reviews, and favorites are each queried independently and reviews/favorites can grow without a natural bound per product. No embedding anti-pattern found, no change needed.

## Indexes: none existed anywhere - fixed

Every custom finder method across all 4 repositories (`ProductRepository`, `ReviewRepository`, `FavoriteRepository`, `OrderRepository`) was running as a full collection scan - zero `@Indexed`/`@CompoundIndex` annotations existed on any entity. Added:

| Entity | Index | Backs |
|---|---|---|
| `Product` | `featured`, `name`, `company` (single-field) | `findByFeaturedTrue`, `findByNameContainingIgnoreCaseOrCompanyContainingIgnoreCase` |
| `Review` | compound `(productId, clerkId)`, single `clerkId` | `existsByProductIdAndClerkId`, `findAllByProductId(OrderByCreatedAtDesc)`, `findByClerkId` |
| `Favorite` | compound `(productId, clerkId)`, single `clerkId` | `findFirstByProductIdAndClerkId`, `findAllByClerkId` |
| `Order` | compound `(clerkId, isPaid, createdAt desc)` | `findAllByClerkIdAndIsPaidTrueOrderByCreatedAtDesc` - field order follows the Equality-Sort-Range pattern (equality fields first, sort field last) |

**Critical companion fix**: Spring Data MongoDB does not create indexes from these annotations by default - `spring.data.mongodb.auto-index-creation` defaults to `false`. Without explicitly setting it to `true` (added to `application.properties`), every index above would have been silently decorative. Confirmed this before considering the fix complete, not after.

`name`/`company` on `Product` get a plain index, not a text index - noted honestly in the code comment: a single-field index still helps MongoDB's planner avoid a full collection scan for a `containing` (regex) query in some cases, but doesn't make the substring scan itself index-backed. A real fix for search-at-scale would be a MongoDB text index or Atlas Search; not added here since this catalog's current size doesn't justify the added complexity - revisit if `searchProducts` becomes a real bottleneck.

## CAP / consistency: appropriate as-is

Product catalog, reviews, and favorites are all fine as eventually-consistent-by-default MongoDB documents - none of them have a correctness requirement that needs multi-document transactions or stronger isolation. No gap found.
