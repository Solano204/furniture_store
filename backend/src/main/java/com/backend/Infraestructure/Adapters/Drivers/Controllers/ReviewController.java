package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.backend.Aplication.Ports.Drivers.IReviewService;
import com.backend.Infraestructure.Adapters.Drivens.Entities.Review;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivers.Security.OwnershipGuard;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class ReviewController {

    private final IReviewService reviewService;
    private final OwnershipGuard ownershipGuard;

    @MutationMapping(name = "createReview")
    public Mono<Review> createReview(@Argument(name = "input") DocumentMappings.CreateReviewInput input) {
        return ownershipGuard.verifyOwnClerkId(input.clerkId())
                .then(reviewService.createReview(input));
    }

    // Public - product reviews are shown on the storefront to any visitor.
    @QueryMapping(name = "getProductReviews")
    public Flux<Review> getProductReviews(@Argument(name = "productId") String productId) {
        return reviewService.getProductReviews(productId);
    }

    @QueryMapping(name = "getReviewUserProduct")
    public Mono<Boolean> getReviewUserProduct(@Argument(name = "productId") String productId,
            @Argument(name = "clerkId") String clerkId) {
        return ownershipGuard.verifyOwnClerkId(clerkId)
                .then(reviewService.getReviewUserProduct(productId, clerkId));
    }

    // Public - aggregate rating shown on the storefront to any visitor.
    @QueryMapping(name = "getReviewAggregate")
    public Mono<DocumentMappings.ReviewAggregate> getReviewAggregate(@Argument(name = "productId") String productId) {
        return reviewService.getReviewAggregate(productId);
    }

    @QueryMapping(name = "getUserReviews")
    public Flux<Review> getUserReviews(@Argument(name = "clerkId") String clerkId) {
        return ownershipGuard.verifyOwnClerkId(clerkId).thenMany(reviewService.getUserReviews(clerkId));
    }

    @MutationMapping(name = "deleteReview")
    public Mono<Boolean> deleteReview(@Argument(name = "id") String id,
            @Argument(name = "clerkId") String clerkId) {
        return ownershipGuard.verifyOwnClerkId(clerkId)
                .then(reviewService.deleteReview(id, clerkId));
    }
}
