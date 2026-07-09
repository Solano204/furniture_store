package com.backend.Aplication.Services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Product;
import com.backend.Infraestructure.Adapters.Drivens.Entities.Review;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ProductRepository;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ReviewRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(reviewRepository, productRepository);
    }

    @Test
    void getReviewAggregate_averagesRatingsAcrossReviews() {
        Review r1 = new Review();
        r1.setRating(4);
        Review r2 = new Review();
        r2.setRating(2);
        when(reviewRepository.findAllByProductId("p1")).thenReturn(Flux.just(r1, r2));

        StepVerifier.create(reviewService.getReviewAggregate("p1"))
                .assertNext(aggregate -> {
                    assertEquals("p1", aggregate.productId());
                    assertEquals(3.0f, aggregate.avgRating());
                    assertEquals(2, aggregate.ratingCount());
                })
                .verifyComplete();
    }

    @Test
    void getReviewAggregate_noReviews_returnsZeroAverageNotDivideByZero() {
        when(reviewRepository.findAllByProductId("p1")).thenReturn(Flux.empty());

        StepVerifier.create(reviewService.getReviewAggregate("p1"))
                .assertNext(aggregate -> {
                    assertEquals(0f, aggregate.avgRating());
                    assertEquals(0, aggregate.ratingCount());
                })
                .verifyComplete();
    }

    @Test
    void getUserReviews_attachesProductToEachReview() {
        Review review = new Review();
        review.setProductId("p1");
        Product product = new Product();
        product.setId("p1");

        when(reviewRepository.findByClerkId("clerk-1")).thenReturn(Flux.just(review));
        when(productRepository.findById("p1")).thenReturn(Mono.just(product));

        StepVerifier.create(reviewService.getUserReviews("clerk-1"))
                .assertNext(r -> assertEquals(product, r.getProduct()))
                .verifyComplete();
    }

    @Test
    void deleteReview_delegatesAndReturnsTrue() {
        when(reviewRepository.deleteByIdAndClerkId("r1", "clerk-1")).thenReturn(Mono.empty());

        StepVerifier.create(reviewService.deleteReview("r1", "clerk-1"))
                .expectNext(true)
                .verifyComplete();
    }
}
