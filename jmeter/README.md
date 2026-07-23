# JMeter load test — Furniture Store backend

`furniture-store-load-test.jmx` load-tests the GraphQL backend (`/graphql`, default port 8080).

## Coverage

- **Public Browsing** (no auth): getFeaturedProducts, getProductById, searchProducts, getProductReviews, getReviewAggregate.
- **Register, Shop, and Order** (auth): register (generates a fresh unique user every iteration via `${__threadNum}`/`${__Random}` — no Groovy/JSR223, so it isn't affected by the JDK-version issue below) → addFavorite → createReview → createOrder → getUserOrders, all sent with the returned JWT as `Authorization: Bearer`.

Every self-registered account is a plain `USER` (see `AuthenticationService#register`), so this plan **cannot** exercise the `ROLE_ADMIN`-gated operations (`createProduct`, `updateProduct`, `updateProductImage`, `deleteProduct`, `getOrders`). To load-test those, grant a test account `ROLE_ADMIN` directly in MongoDB, log in to get its JWT, and add a separate thread group using that token.

GraphQL always returns HTTP 200 even for business-logic errors (auth failures, validation errors, etc.) — the included assertion only checks the HTTP status code. Check the Summary/Aggregate Report's error % and, if it's non-zero with 200s across the board, inspect response bodies for embedded `"errors"` to see why.

## Running

```
cd jmeter
jmeter -n -t furniture-store-load-test.jmx -l results.jtl \
  -Jhost=localhost -Jport=8080 \
  -Jpublic_threads=30 -Jauth_threads=10 -Jloops=20 -Jramp_time=10
```

Start the backend first (this plan never starts it). Open `results.jtl` in JMeter's GUI (File > Open) or run `jmeter -g results.jtl -o report/` to generate an HTML dashboard.

## JDK note

This machine's default JDK (25) can't compile Lombok/Groovy-based tooling used by this project (Maven build, and would have broken JMeter's Groovy JSR223 elements too, which is why this plan avoids them). If you add JSR223 elements later, run JMeter with `JAVA_HOME` pointed at JDK 21 to avoid `Unsupported class file major version` errors — same fix used for the Maven build.

## Parameters

| Property | Default | Meaning |
|---|---|---|
| `host` | `localhost` | Backend host |
| `port` | `8080` | Backend port |
| `public_threads` | `30` | Concurrent users in Public Browsing |
| `auth_threads` | `10` | Concurrent users in Register/Shop/Order |
| `loops` | `20` | Iterations per thread |
| `ramp_time` | `10` | Seconds to start all threads in a group |
