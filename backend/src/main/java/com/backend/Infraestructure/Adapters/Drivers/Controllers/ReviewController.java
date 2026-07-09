package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.backend.Aplication.Ports.Drivers.IReviewService;
import com.backend.Infraestructure.Adapters.Drivens.Entities.Review;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class ReviewController {

    private final IReviewService reviewService;

    @MutationMapping(name = "createReview")
    public Mono<Review> createReview(@Argument(name = "input") DocumentMappings.CreateReviewInput input) {
        return reviewService.createReview(input);
    }

    @QueryMapping(name = "getProductReviews")
    public Flux<Review> getProductReviews(@Argument(name = "productId") String productId) {
        return reviewService.getProductReviews(productId);
    }

    @QueryMapping(name = "getReviewUserProduct")
    public Mono<Boolean> getReviewUserProduct(@Argument(name = "productId") String productId,
            @Argument(name = "clerkId") String clerkId) {
        return reviewService.getReviewUserProduct(productId, clerkId);
    }

    @QueryMapping(name = "getReviewAggregate")
    public Mono<DocumentMappings.ReviewAggregate> getReviewAggregate(@Argument(name = "productId") String productId) {
        return reviewService.getReviewAggregate(productId);
    }

    @QueryMapping(name = "getUserReviews")
    public Flux<Review> getUserReviews(@Argument(name = "clerkId") String clerkId) {
        return reviewService.getUserReviews(clerkId);
    }

    @MutationMapping(name = "deleteReview")
    public Mono<Boolean> deleteReview(@Argument(name = "id") String id,
            @Argument(name = "clerkId") String clerkId) {
        return reviewService.deleteReview(id, clerkId);
    }
}
