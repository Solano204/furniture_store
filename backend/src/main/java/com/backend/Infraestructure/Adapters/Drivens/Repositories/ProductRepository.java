package com.backend.Infraestructure.Adapters.Drivens.Repositories;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Product;

import reactor.core.publisher.Flux;

@Repository
public interface ProductRepository extends ReactiveMongoRepository<Product, String> {
    Flux<Product> findByFeaturedTrue();
    Flux<Product> findByNameContainingIgnoreCaseOrCompanyContainingIgnoreCase(String name, String company);
}
