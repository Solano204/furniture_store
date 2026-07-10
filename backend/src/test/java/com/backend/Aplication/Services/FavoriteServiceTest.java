package com.backend.Aplication.Services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Favorite;
import com.backend.Infraestructure.Adapters.Drivens.Entities.Product;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.FavoriteRepository;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ProductRepository;

import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private ProductRepository productRepository;

    private FavoriteService favoriteService;

    @BeforeEach
    void setUp() {
        favoriteService = new FavoriteService(favoriteRepository, productRepository);
    }

    @Test
    void addFavorite_savesThenAttachesProduct() {
        DocumentMappings.AddFavoriteInput input = new DocumentMappings.AddFavoriteInput("p1", "clerk-1");
        Product product = new Product();
        product.setId("p1");

        when(favoriteRepository.save(any(Favorite.class))).thenAnswer(inv -> {
            Favorite f = inv.getArgument(0);
            f.setId("fav-1");
            return Mono.just(f);
        });
        when(productRepository.findById("p1")).thenReturn(Mono.just(product));

        StepVerifier.create(favoriteService.addFavorite(input))
                .assertNext(favorite -> {
                    assertEquals("p1", favorite.getProductId());
                    assertEquals("clerk-1", favorite.getClerkId());
                    assertEquals(product, favorite.getProduct());
                })
                .verifyComplete();
    }

    @Test
    void deleteFavorite_ownedByRequester_deletesAndReturnsTrue() {
        Favorite favorite = new Favorite();
        favorite.setId("fav-1");
        favorite.setClerkId("clerk-1");
        when(favoriteRepository.findById("fav-1")).thenReturn(Mono.just(favorite));
        when(favoriteRepository.deleteById("fav-1")).thenReturn(Mono.empty());

        StepVerifier.create(favoriteService.deleteFavorite("fav-1", "clerk-1"))
                .expectNext(true)
                .verifyComplete();
    }

    @Test
    void deleteFavorite_ownedBySomeoneElse_returnsFalseWithoutDeleting() {
        Favorite favorite = new Favorite();
        favorite.setId("fav-1");
        favorite.setClerkId("clerk-1");
        when(favoriteRepository.findById("fav-1")).thenReturn(Mono.just(favorite));

        StepVerifier.create(favoriteService.deleteFavorite("fav-1", "someone-else"))
                .expectNext(false)
                .verifyComplete();

        verify(favoriteRepository, never()).deleteById(any(String.class));
    }

    @Test
    void deleteFavorite_doesNotExist_returnsFalse() {
        when(favoriteRepository.findById("missing")).thenReturn(Mono.empty());

        StepVerifier.create(favoriteService.deleteFavorite("missing", "clerk-1"))
                .expectNext(false)
                .verifyComplete();
    }
}
