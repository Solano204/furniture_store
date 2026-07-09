package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.backend.Aplication.Ports.Drivers.IFavoriteService;
import com.backend.Infraestructure.Adapters.Drivens.Entities.Favorite;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class FavoriteController {

    private final IFavoriteService favoriteService;

    @QueryMapping(name = "getFavorites")
    public Flux<Favorite> getFavorites(@Argument(name = "clerkId") String clerkId) {
        return favoriteService.getFavorites(clerkId);
    }

    @QueryMapping(name = "getFavorite")
    public Mono<Favorite> getFavorite(
            @Argument(name = "productId") String productId,
            @Argument(name = "clerkId") String clerkId) {
        return favoriteService.getFavorite(productId, clerkId);
    }

    @MutationMapping(name = "addFavorite")
    public Mono<Favorite> addFavorite(@Argument(name = "input") DocumentMappings.AddFavoriteInput input) {
        return favoriteService.addFavorite(input);
    }

    @MutationMapping(name = "deleteFavorite")
    public Mono<Boolean> deleteFavorite(@Argument(name = "favoriteId") String favoriteId) {
        return favoriteService.deleteFavorite(favoriteId);
    }
}
