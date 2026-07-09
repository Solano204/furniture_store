package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Review;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings.CreateReviewInput;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ProductRepository;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ReviewRepository;

import lombok.Data;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@Data
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    // Reviews
    @MutationMapping(name = "createReview")
    public Mono<Review> createReview(@Argument(name = "input") DocumentMappings.CreateReviewInput input) {
        Review review = new Review();
        review.setProductId(input.productId());
        review.setRating(input.rating());
        review.setComment(input.comment());
        review.setAuthorName(input.authorName());
        review.setAuthorImageUrl(input.authorImageUrl());
        review.setClerkId(input.clerkId());
        review.setCreatedAt(LocalDate.now());
        review.setUpdatedAt(LocalDate.now());
        return reviewRepository.save(review);
    }

    @QueryMapping(name = "getProductReviews")
    public Flux<Review> getProductReviews(@Argument(name = "productId") String productId) {
        return reviewRepository.findAllByProductIdOrderByCreatedAtDesc(productId);
    }

    @QueryMapping(name = "getReviewUserProduct")
    public Mono<Boolean> getReviewUserProduct(@Argument(name = "productId") String productId,
            @Argument(name = "clerkId") String clerkId) {
        return reviewRepository.existsByProductIdAndClerkId(productId, clerkId);
    }

    @QueryMapping(name = "getReviewAggregate")
    public Mono<DocumentMappings.ReviewAggregate> getReviewAggregate(@Argument(name = "productId") String productId) {
        return reviewRepository.findAllByProductId(productId)
                .collectList()
                .map(reviews -> {
                    float avgRating = 0f;
                    int ratingCount = reviews.size();

                    for (Review review : reviews) {
                        avgRating += review.getRating();
                    }
                    avgRating = ratingCount == 0 ? 0 : avgRating / ratingCount;
                    return new DocumentMappings.ReviewAggregate(productId, avgRating, ratingCount);
                });
    }

    @QueryMapping(name = "getUserReviews")
    public Flux<Review> getUserReviews(@Argument(name = "clerkId") String clerkId) {
        return reviewRepository.findByClerkId(clerkId)
                .flatMap(review -> productRepository.findById(review.getProductId())
                        .map(product -> {
                            review.setProduct(product);
                            return review;
                        }));
    }

    @MutationMapping(name = "deleteReview")
    public Mono<Boolean> deleteReview(@Argument(name = "id") String id,
                                       @Argument(name = "clerkId") String clerkId) {
        System.out.println("id: " + id + " clerkId: " + clerkId);
        return reviewRepository.deleteByIdAndClerkId(id, clerkId).then(Mono.just(true));
    }
    

}
