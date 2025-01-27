package com.backend.Infraestructure.Adapters.Drivers.Security.Services;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.stereotype.Service;


import com.backend.Infraestructure.Adapters.Drivens.Repositories.TokenRepository;
import com.backend.Infraestructure.Adapters.Drivers.Security.GraphQLCustomException;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
@Service
@RequiredArgsConstructor
public class LogoutService {

    private final TokenRepository tokenRepository;

    public Mono<Boolean> logout(WebGraphQlRequest request) {
        // Extract the Authorization header from the request
        String authHeader = request.getHeaders().getFirst("Authorization");


        System.out.println("AuthHeader: " + authHeader);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Mono.just(false);
        }

        System.out.println("AuthHeader: " + authHeader);
        // Extract the JWT token
        String jwt = authHeader.substring(7);

        // Fetch the token entity based on the JWT
        return tokenRepository.findByToken(jwt)  // Use findByToken instead of existsByToken to retrieve the token entity
                .flatMap(storedToken -> 
                    // Delete the token after revoking
                    tokenRepository.delete(storedToken)
                        .then(Mono.just(true)) // Return a boolean value indicating success
                )
                .switchIfEmpty(Mono.just(false));
    }
}

