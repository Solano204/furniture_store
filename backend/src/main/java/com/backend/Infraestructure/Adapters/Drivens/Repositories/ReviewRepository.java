package com.backend.Infraestructure.Adapters.Drivens.Repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Review;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

public interface ReviewRepository extends ReactiveMongoRepository<Review, String> {
    Flux<Review> findByProductId(String productId);
    Mono<Boolean> existsByProductIdAndClerkId(String reviewId, String clerkId);
    Flux<Review> findByClerkId(String clerkId);
    Flux<Review> findAllByProductIdOrderByCreatedAtDesc(String productId);
    Flux<Review> findAllByProductId(String productId);
    Mono<Void> deleteByIdAndClerkId(String  reviewId, String clerkId);
}
