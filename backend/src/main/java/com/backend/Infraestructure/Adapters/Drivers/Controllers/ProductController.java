package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Product;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ProductRepository;

import lombok.Data;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@Data
public class ProductController {

    private final ProductRepository productRepository;

    // Products
    @QueryMapping(name = "getFeaturedProducts")
    public Flux<Product> getFeaturedProducts() {
        return productRepository.findByFeaturedTrue();
    }

    @QueryMapping(name = "getProductById")
    public Mono<Product> getProductById(@Argument(name = "productId") String productId) {
        return productRepository.findById(productId).switchIfEmpty(Mono.empty());
    }

    @QueryMapping(name = "searchProducts")
    public Flux<Product> searchProducts(@Argument(name = "company") String company,
            @Argument(name = "name") String name) {
        return productRepository.findByNameContainingIgnoreCaseOrCompanyContainingIgnoreCase(name, company);
    }

    @MutationMapping(name = "createProduct")
    public Mono<Product> createProduct(@Argument(name = "input") DocumentMappings.CreateProductInput input) {
        Product product = new Product();
        product.setName(input.name());
        product.setDescription(input.description());
        product.setCompany(input.company());
        product.setImage(input.image());
        product.setClerkId(input.clerkId());
        product.setFeatured(true);
        product.setCreatedAt(LocalDate.now());
        product.setUpdatedAt(LocalDate.now());
        product.setPrice(input.price());
        System.out.println(input.price());
        return productRepository.save(product);
    }

    @MutationMapping(name = "updateProduct")
    public Mono<Product> updateProduct(
            @Argument(name = "productId") String productId,
            @Argument(name = "input") DocumentMappings.UpdateProductInput input) {
        return productRepository.findById(productId)
                .flatMap(product -> {
                    // Only update fields that are not null
                    if (input.name() != null) {
                        product.setName(input.name());
                    }
                    if (input.company() != null) {
                        product.setCompany(input.company());
                    }
                    if (input.description() != null) {
                        product.setDescription(input.description());
                    }
                    if (input.price() != null) { // Assuming `price` is a nullable type
                        product.setPrice(input.price());
                    }
                    // Update the `updatedAt` field
                    product.setUpdatedAt(LocalDate.now());

                    // Save the updated product
                    return productRepository.save(product);
                });
    }

    @MutationMapping(name = "updateProductImage")
    public Mono<Product> updateProduct(@Argument(name = "productId") String productId,
            @Argument(name = "image") String image) {
        return productRepository.findById(productId)
                .flatMap(product -> {
                    // Update the product fields
                    product.setImage(image);
                    product.setUpdatedAt(LocalDate.now());
                    // Save the updated product
                    return productRepository.save(product);
                });
    }

    @MutationMapping(name = "deleteProduct")
    public Mono<Product> deleteProduct(@Argument(name = "productId") String productId) {
        return productRepository.findById(productId)
                .flatMap(product -> productRepository.delete(product)
                        .then(Mono.just(product)));
    }

}
