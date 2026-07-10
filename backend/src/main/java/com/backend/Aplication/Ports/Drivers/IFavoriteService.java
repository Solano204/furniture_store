package com.backend.Aplication.Ports.Drivers;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Favorite;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface IFavoriteService {
    Flux<Favorite> getFavorites(String clerkId);

    Mono<Favorite> getFavorite(String productId, String clerkId);

    Mono<Favorite> addFavorite(DocumentMappings.AddFavoriteInput input);

    Mono<Boolean> deleteFavorite(String favoriteId, String requestingClerkId);
}
