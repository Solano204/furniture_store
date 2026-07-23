package com.backend.Aplication.Services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Product;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ProductRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    private ProductService productService;

    @BeforeEach
    void setUp() {
        productService = new ProductService(productRepository);
    }

    @Test
    void createProduct_setsFeaturedTrueAndTimestamps() {
        DocumentMappings.CreateProductInput input = new DocumentMappings.CreateProductInput(
                "Chair", "A nice chair", "img.png", "clerk-1", "Acme", 100);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> Mono.just(inv.getArgument(0)));

        StepVerifier.create(productService.createProduct(input))
                .assertNext(product -> {
                    assertEquals("Chair", product.getName());
                    assertEquals("Acme", product.getCompany());
                    assertEquals(100, product.getPrice());
                    assertEquals(Boolean.TRUE, product.getFeatured());
                    assertEquals("clerk-1", product.getClerkId());
                })
                .verifyComplete();
    }

    @Test
    void updateProduct_onlyOverwritesNonNullFields() {
        Product existing = new Product();
        existing.setId("p1");
        existing.setName("Old Name");
        existing.setCompany("Old Co");
        existing.setDescription("Old Desc");
        existing.setPrice(50);

        DocumentMappings.UpdateProductInput input = new DocumentMappings.UpdateProductInput(
                "New Name", null, null, null);

        when(productRepository.findById("p1")).thenReturn(Mono.just(existing));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> Mono.just(inv.getArgument(0)));

        StepVerifier.create(productService.updateProduct("p1", input))
                .assertNext(product -> {
                    assertEquals("New Name", product.getName());
                    assertEquals("Old Co", product.getCompany());
                    assertEquals("Old Desc", product.getDescription());
                    assertEquals(50, product.getPrice());
                })
                .verifyComplete();
    }

    @Test
    void updateProduct_nonExistentProduct_completesEmpty() {
        when(productRepository.findById("missing")).thenReturn(Mono.empty());

        StepVerifier.create(productService.updateProduct("missing",
                        new DocumentMappings.UpdateProductInput("x", null, null, null)))
                .verifyComplete();
    }

    @Test
    void deleteProduct_deletesAndReturnsDeletedProduct() {
        Product existing = new Product();
        existing.setId("p1");
        when(productRepository.findById("p1")).thenReturn(Mono.just(existing));
        when(productRepository.delete(existing)).thenReturn(Mono.empty());

        StepVerifier.create(productService.deleteProduct("p1"))
                .expectNext(existing)
                .verifyComplete();

        verify(productRepository).delete(existing);
    }

    @Test
    void searchProducts_delegatesToRepositoryWithNameAndCompany() {
        when(productRepository.findByNameContainingIgnoreCaseOrCompanyContainingIgnoreCase(eq("chair"), eq("acme")))
                .thenReturn(Flux.empty());

        StepVerifier.create(productService.searchProducts("acme", "chair"))
                .verifyComplete();

        verify(productRepository).findByNameContainingIgnoreCaseOrCompanyContainingIgnoreCase("chair", "acme");
    }
}
