package com.backend.Aplication.Services;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.backend.Aplication.Ports.Drivers.IProductService;
import com.backend.Infraestructure.Adapters.Drivens.Entities.Product;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ProductRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ProductService implements IProductService {

    private final ProductRepository productRepository;

    @Override
    public Flux<Product> getFeaturedProducts() {
        return productRepository.findByFeaturedTrue();
    }

    @Override
    public Mono<Product> getProductById(String productId) {
        return productRepository.findById(productId);
    }

    @Override
    public Flux<Product> searchProducts(String company, String name) {
        return productRepository.findByNameContainingIgnoreCaseOrCompanyContainingIgnoreCase(name, company);
    }

    @Override
    public Mono<Product> createProduct(DocumentMappings.CreateProductInput input) {
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
        return productRepository.save(product);
    }

    @Override
    public Mono<Product> updateProduct(String productId, DocumentMappings.UpdateProductInput input) {
        return productRepository.findById(productId)
                .flatMap(product -> {
                    if (input.name() != null) {
                        product.setName(input.name());
                    }
                    if (input.company() != null) {
                        product.setCompany(input.company());
                    }
                    if (input.description() != null) {
                        product.setDescription(input.description());
                    }
                    if (input.price() != null) {
                        product.setPrice(input.price());
                    }
                    product.setUpdatedAt(LocalDate.now());
                    return productRepository.save(product);
                });
    }

    @Override
    public Mono<Product> updateProductImage(String productId, String image) {
        return productRepository.findById(productId)
                .flatMap(product -> {
                    product.setImage(image);
                    product.setUpdatedAt(LocalDate.now());
                    return productRepository.save(product);
                });
    }

    @Override
    public Mono<Product> deleteProduct(String productId) {
        return productRepository.findById(productId)
                .flatMap(product -> productRepository.delete(product).then(Mono.just(product)));
    }
}
