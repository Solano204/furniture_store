package com.backend.Aplication.Ports.Drivers;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Review;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface IReviewService {
    Mono<Review> createReview(DocumentMappings.CreateReviewInput input);

    Flux<Review> getProductReviews(String productId);

    Mono<Boolean> getReviewUserProduct(String productId, String clerkId);

    Mono<DocumentMappings.ReviewAggregate> getReviewAggregate(String productId);

    Flux<Review> getUserReviews(String clerkId);

    Mono<Boolean> deleteReview(String id, String clerkId);
}
