package com.backend.Infraestructure.Adapters.Drivens.Repositories;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Token;

import reactor.core.publisher.Mono;



public interface TokenRepository extends ReactiveMongoRepository<Token, String> {
    Mono<Void> deleteAllByUser(String user);
    Mono<Void> deleteByToken(Boolean storedToken); 
    Mono<Boolean> existsByUser(String user);
    Mono<Boolean> existsByToken(String token);
    Mono<Token> findByToken(String token);
}
