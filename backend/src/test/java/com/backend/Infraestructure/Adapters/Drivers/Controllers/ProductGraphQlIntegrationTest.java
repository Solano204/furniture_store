package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.graphql.test.tester.HttpGraphQlTester;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Product;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ProductRepository;

/**
 * Exercises the real request pipeline end to end: HTTP -> GraphQL ->
 * GraphQlSecurityInterceptor (public-query bypass) -> ProductController ->
 * ProductService -> ProductRepository -> the real local MongoDB.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ProductGraphQlIntegrationTest {

    private static final String MARKER_COMPANY = "IntegrationTestCo";

    @Autowired
    private ProductRepository productRepository;

    @LocalServerPort
    private int port;

    private HttpGraphQlTester graphQlTester;

    private String seededProductId;

    @BeforeEach
    void setUp() {
        WebTestClient webTestClient = WebTestClient.bindToServer()
                .baseUrl("http://localhost:" + port + "/graphql")
                .build();
        graphQlTester = HttpGraphQlTester.create(webTestClient);

        Product product = new Product();
        product.setName("Integration Test Chair");
        product.setDescription("Seeded directly via repository for the integration test");
        product.setCompany(MARKER_COMPANY);
        product.setImage("chair.png");
        product.setClerkId("clerk-integration");
        product.setFeatured(true);
        product.setPrice(199);
        product.setCreatedAt(LocalDate.now());
        product.setUpdatedAt(LocalDate.now());

        seededProductId = productRepository.save(product).block().getId();
    }

    @AfterEach
    void tearDown() {
        productRepository.deleteById(seededProductId).block();
    }

    @Test
    void getFeaturedProducts_returnsSeededProductThroughFullStack() {
        List<String> names = graphQlTester.document("query { getFeaturedProducts { id name company price } }")
                .execute()
                .path("getFeaturedProducts[*].name")
                .entityList(String.class)
                .get();

        assertContains(names, "Integration Test Chair");
    }

    @Test
    void searchProducts_findsSeededProductByNameWithoutAuthorization() {
        List<String> ids = graphQlTester.document(
                        "query($company: String!, $name: String!) { searchProducts(company: $company, name: $name) { id } }")
                .variable("company", "no-such-company-xyz")
                .variable("name", "Integration Test Chair")
                .execute()
                .path("searchProducts[*].id")
                .entityList(String.class)
                .get();

        assertContains(ids, seededProductId);
    }

    @Test
    void getProductById_returnsSeededProduct() {
        graphQlTester.document("query($id: String!) { getProductById(productId: $id) { id name price } }")
                .variable("id", seededProductId)
                .execute()
                .path("getProductById.price")
                .entity(Integer.class)
                .isEqualTo(199);
    }

    private static void assertContains(List<String> values, String expected) {
        if (!values.contains(expected)) {
            throw new AssertionError("Expected " + values + " to contain " + expected);
        }
    }
}
