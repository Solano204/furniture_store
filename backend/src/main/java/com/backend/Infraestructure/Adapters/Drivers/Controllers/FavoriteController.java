package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Favorite;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings.AddFavoriteInput;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.FavoriteRepository;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.ProductRepository;

import lombok.Data;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@Data
public class FavoriteController {
    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;

    @QueryMapping(name = "getFavorites")
    public Flux<Favorite> getFavorites(@Argument(name = "clerkId") String clerkId) {
        return favoriteRepository.findAllByClerkId(clerkId)
                .flatMap(favorite -> {
                    return productRepository.findById(favorite.getProductId()).map(product -> {
                        favorite.setProduct(product);
                        return favorite;
                    });
                });
    }

    @QueryMapping(name = "getFavorite")
public Mono<Favorite> getFavorite(
    @Argument(name = "productId") String productId,
    @Argument(name = "clerkId") String clerkId) {
        
    return favoriteRepository.findFirstByProductIdAndClerkId(productId, clerkId)
            .flatMap(favorite -> {
                return productRepository.findById(favorite.getProductId()).map(product -> {
                    favorite.setProduct(product);
                    return favorite;
                });
            });
}


@MutationMapping(name = "addFavorite")
public Mono<Favorite> addFavorite(@Argument(name = "input") DocumentMappings.AddFavoriteInput input) {
    // Create a new Favorite object
    Favorite favorite = new Favorite();
    favorite.setProductId(input.productId());
    favorite.setClerkId(input.clerkId());
    favorite.setCreatedAt(LocalDate.now());
    favorite.setUpdatedAt(LocalDate.now());

    // Save the favorite to the repository
    return favoriteRepository.save(favorite)
        .flatMap(savedFavorite -> {
            // After saving, retrieve the product associated with the favorite
            return productRepository.findById(savedFavorite.getProductId())
                .map(product -> {
                    // Set the product in the favorite object
                    savedFavorite.setProduct(product);
                    return savedFavorite;
                });
        });
}

    @MutationMapping(name = "deleteFavorite")
    public Mono<Boolean> deleteFavorite(@Argument(name = "favoriteId") String favoriteId) {
        return favoriteRepository.deleteById(favoriteId).then( Mono.just(true));
    }

}
