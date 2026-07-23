package com.backend.Aplication.Services;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.backend.Aplication.Ports.Drivers.IReviewService;
import com.backend.Infraestructure.Adapters.Drivens.Entities.Review;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ProductRepository;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ReviewRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ReviewService implements IReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @Override
    public Mono<Review> createReview(DocumentMappings.CreateReviewInput input) {
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

    @Override
    public Flux<Review> getProductReviews(String productId) {
        return reviewRepository.findAllByProductIdOrderByCreatedAtDesc(productId);
    }

    @Override
    public Mono<Boolean> getReviewUserProduct(String productId, String clerkId) {
        return reviewRepository.existsByProductIdAndClerkId(productId, clerkId);
    }

    @Override
    public Mono<DocumentMappings.ReviewAggregate> getReviewAggregate(String productId) {
        return reviewRepository.findAllByProductId(productId)
                .collectList()
                .map(reviews -> {
                    int ratingCount = reviews.size();
                    float totalRating = 0f;
                    for (Review review : reviews) {
                        totalRating += review.getRating();
                    }
                    float avgRating = ratingCount == 0 ? 0 : totalRating / ratingCount;
                    return new DocumentMappings.ReviewAggregate(productId, avgRating, ratingCount);
                });
    }

    @Override
    public Flux<Review> getUserReviews(String clerkId) {
        return reviewRepository.findByClerkId(clerkId)
                .flatMap(review -> productRepository.findById(review.getProductId())
                        .map(product -> {
                            review.setProduct(product);
                            return review;
                        }));
    }

    @Override
    public Mono<Boolean> deleteReview(String id, String clerkId) {
        return reviewRepository.deleteByIdAndClerkId(id, clerkId).then(Mono.just(true));
    }
}
