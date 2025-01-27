package com.backend.Infraestructure.Adapters.Drivens.Repositories;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Favorite;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


public interface FavoriteRepository extends ReactiveMongoRepository<Favorite, String> {
    Mono<Favorite> findByClerkId(String clerkId);
    Mono<Favorite> findFirstByProductIdAndClerkId(String productId, String clerkId);
    Flux<Favorite> findAllByClerkId(String clerkId);
    Mono<Void> deleteByProductIdAndClerkId(String productId, String clerkId);
}