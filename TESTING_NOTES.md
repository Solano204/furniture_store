# Testing Notes — furniture_store

Doc 6 deliverable.

## Backend: solid pyramid, one real-infra integration test fixed

Good coverage already: unit tests per service (`ProductServiceTest`, `OrderServiceTest`, etc.), dedicated security tests (`GraphQlSecurityInterceptorTest`, `OwnershipGuardTest`, `JwtServiceTest`) - the security-critical parsing/allow-list logic documented in Doc 1 is actually tested, not just carefully commented.

`ProductGraphQlIntegrationTest` was the one gap: a real `@SpringBootTest` driving an actual GraphQL request end-to-end, but pointed at "the real local MongoDB" (`application-test.properties`' hardcoded `mongodb://localhost:27017/...`) - only passes if Mongo happens to be running locally, and shares a database with whatever else uses that instance. Fixed with `@ServiceConnection` + `Testcontainers.MongoDBContainer` (`mongo:7`, same tag as the compose stack) - Spring Boot 3.1+'s auto-wiring annotation, no manual `@DynamicPropertySource` needed since this project is on 3.3.5 (unlike food-ordering-system's 3.0.5, which predates it).

## Frontend: test tooling installed, zero tests written

`vitest` is a real devDependency (`^4.1.10`) and `__tests__/` exists as a directory, but it's empty - scaffolded, never used. Not writing tests here blind: without an existing test to learn conventions from (assertion style, whether Apollo/Prisma get mocked or a real backend is expected, etc. - unlike the backend where 11 existing test files established a clear pattern to extend), guessing at a first test risks setting the wrong convention for whoever writes the next one. The `admin/products` delete-button bug fixed in Doc 4 is exactly the kind of regression a `deleteProductAction` unit test (mocking the GraphQL client, asserting it calls the right mutation) would have caught immediately - that's the concrete starting point once you're ready to establish the pattern.
