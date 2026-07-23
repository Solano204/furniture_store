# Resilience Notes — furniture_store

Doc 8 deliverable.

## Real synchronous dependencies here, unlike food-ordering-system

This system has actual sync calls worth hardening, unlike food-ordering-system's all-async Kafka saga: frontend → backend GraphQL (Apollo Client), and frontend → Supabase Storage (image upload/delete).

## Fixed: no timeout on the Apollo Client → backend GraphQL calls

`fetch()` has no default timeout - a hung or slow backend request would hang whatever Server Action or page render called it indefinitely. Added a 10s timeout via a custom `fetch` on `HttpLink` (`Client.tsx`).

Worth calling out the mistake I almost shipped here: my first pass set the timeout via a static `fetchOptions: { signal: AbortSignal.timeout(10_000) }` on the `HttpLink` constructor. `AbortSignal.timeout()` starts counting the moment it's created, not when a request actually starts - since `HttpLink` is constructed once per Apollo Client instance and reused for every subsequent request, that signal would have fired once after 10 seconds and then stayed permanently aborted for every request after that point, not just slow ones. Fixed by building the signal fresh inside a custom `fetch` function, so every individual request gets its own 10-second budget.

## Not fixed: Supabase Storage (image upload/delete)

`uploadImage`/`deleteImage` (`supebase.ts`) have no timeout and no retry. `deleteImage` in particular has zero error handling - a failed delete call propagates an uncaught rejection to whatever called it. Not changing this blind: the Supabase JS SDK has its own internal retry/timeout behavior I haven't verified, and wrapping it without checking what the SDK already does risks fighting its own retry logic instead of complementing it. Worth a deliberate look at the SDK's docs/config before touching this, not a guessed fix.

## Not applicable

Circuit breakers / bulkheads between backend and MongoDB: this is a single backend talking to a single database it fully controls, not a call to an independent service with its own failure modes - Spring Data's reactive driver already handles connection-level retries. No distinct resilience layer needed on top.
