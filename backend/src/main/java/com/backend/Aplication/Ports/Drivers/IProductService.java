package com.backend.Aplication.Ports.Drivers;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Product;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface IProductService {
    Flux<Product> getFeaturedProducts();

    Mono<Product> getProductById(String productId);

    Flux<Product> searchProducts(String company, String name);

    Mono<Product> createProduct(DocumentMappings.CreateProductInput input);

    Mono<Product> updateProduct(String productId, DocumentMappings.UpdateProductInput input);

    Mono<Product> updateProductImage(String productId, String image);

    Mono<Product> deleteProduct(String productId);
}
