package com.backend.Infraestructure.Adapters.Drivens.Repositories;

import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

import com.backend.Infraestructure.Adapters.Drivens.Entities.User;

import reactor.core.publisher.Mono;

@Repository
public interface UserRepository extends ReactiveMongoRepository<User, String> {
    
    // Find user by username
    @Query("{ 'username': ?0 }")
    Mono<User> findByUsername(String username);

    // Check if a user exists by username
    @Query(value = "{ 'username': ?0 }", exists = true)
    Mono<Boolean> existsByUsername(String username);
}
