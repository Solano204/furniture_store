package com.backend.Aplication.Services;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.backend.Aplication.Ports.Drivers.IFavoriteService;
import com.backend.Infraestructure.Adapters.Drivens.Entities.Favorite;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.FavoriteRepository;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ProductRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class FavoriteService implements IFavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;

    @Override
    public Flux<Favorite> getFavorites(String clerkId) {
        return favoriteRepository.findAllByClerkId(clerkId)
                .flatMap(favorite -> productRepository.findById(favorite.getProductId())
                        .map(product -> {
                            favorite.setProduct(product);
                            return favorite;
                        }));
    }

    @Override
    public Mono<Favorite> getFavorite(String productId, String clerkId) {
        return favoriteRepository.findFirstByProductIdAndClerkId(productId, clerkId)
                .flatMap(favorite -> productRepository.findById(favorite.getProductId())
                        .map(product -> {
                            favorite.setProduct(product);
                            return favorite;
                        }));
    }

    @Override
    public Mono<Favorite> addFavorite(DocumentMappings.AddFavoriteInput input) {
        Favorite favorite = new Favorite();
        favorite.setProductId(input.productId());
        favorite.setClerkId(input.clerkId());
        favorite.setCreatedAt(LocalDate.now());
        favorite.setUpdatedAt(LocalDate.now());

        return favoriteRepository.save(favorite)
                .flatMap(savedFavorite -> productRepository.findById(savedFavorite.getProductId())
                        .map(product -> {
                            savedFavorite.setProduct(product);
                            return savedFavorite;
                        }));
    }

    @Override
    public Mono<Boolean> deleteFavorite(String favoriteId, String requestingClerkId) {
        // Mirrors ReviewService#deleteReview: a favorite that doesn't exist and
        // one that exists but isn't owned by the requester both just report
        // false, rather than the service reaching into the driver layer to
        // throw a GraphQL-flavored error.
        return favoriteRepository.findById(favoriteId)
                .filter(favorite -> favorite.getClerkId().equals(requestingClerkId))
                .flatMap(favorite -> favoriteRepository.deleteById(favoriteId).thenReturn(true))
                .defaultIfEmpty(false);
    }
}
