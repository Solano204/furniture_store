package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.backend.Aplication.Ports.Drivers.IProductService;
import com.backend.Infraestructure.Adapters.Drivens.Entities.Product;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class ProductController {

    private final IProductService productService;

    @QueryMapping(name = "getFeaturedProducts")
    public Flux<Product> getFeaturedProducts() {
        return productService.getFeaturedProducts();
    }

    @QueryMapping(name = "getProductById")
    public Mono<Product> getProductById(@Argument(name = "productId") String productId) {
        return productService.getProductById(productId);
    }

    @QueryMapping(name = "searchProducts")
    public Flux<Product> searchProducts(@Argument(name = "company") String company,
            @Argument(name = "name") String name) {
        return productService.searchProducts(company, name);
    }

    @MutationMapping(name = "createProduct")
    public Mono<Product> createProduct(@Argument(name = "input") DocumentMappings.CreateProductInput input) {
        return productService.createProduct(input);
    }

    @MutationMapping(name = "updateProduct")
    public Mono<Product> updateProduct(
            @Argument(name = "productId") String productId,
            @Argument(name = "input") DocumentMappings.UpdateProductInput input) {
        return productService.updateProduct(productId, input);
    }

    @MutationMapping(name = "updateProductImage")
    public Mono<Product> updateProductImage(@Argument(name = "productId") String productId,
            @Argument(name = "image") String image) {
        return productService.updateProductImage(productId, image);
    }

    @MutationMapping(name = "deleteProduct")
    public Mono<Product> deleteProduct(@Argument(name = "productId") String productId) {
        return productService.deleteProduct(productId);
    }
}
