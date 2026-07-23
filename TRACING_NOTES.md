# Tracing Notes — furniture_store

Doc 7 deliverable. Simpler than food-ordering-system's: this backend has no Kafka/CDC to propagate trace context through - it's just GraphQL over HTTP against reactive MongoDB, so `micrometer-tracing-bridge-brave` + `zipkin-reporter-brave` on the classpath is enough to get automatic spans for every GraphQL operation and every reactive Mongo call, no manual propagation code needed anywhere.

## What's covered

- Every GraphQL query/mutation the backend serves gets an automatic span (`spring-boot-starter-graphql` + `spring-boot-starter-webflux` are both auto-instrumented once the tracing bridge is present).
- `management.tracing.sampling.probability=1.0` for local dev, same as food-ordering-system.
- Zipkin added to `docker-compose.yaml` (in-memory storage - same reasoning as food-ordering-system's: no Elasticsearch needed for local trace data that doesn't need to survive a restart).

## What's NOT covered: frontend correlation

The Next.js frontend calling the backend via Apollo Client doesn't propagate a trace context header today, so a request that starts in the frontend (a page load that triggers a GraphQL query, or a Server Action that calls Prisma directly) shows up in Zipkin as a backend-only trace with no visibility into what the frontend was doing before or around that call.

Not implementing this pass: getting real frontend-to-backend trace correlation means an OpenTelemetry SDK on the Node.js side (a different stack entirely from this backend's Brave/Zipkin bridge - `@opentelemetry/sdk-node` + an OTLP or Zipkin exporter), configured to inject a `b3` (or `traceparent`) header on every Apollo Client request. That's a real, separate piece of instrumentation work in a different language ecosystem, not a config tweak - flagging it clearly rather than leaving it implicit, same as the outbox/CDC tracing gap documented for food-ordering-system.
