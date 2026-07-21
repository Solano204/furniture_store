package com.backend.Infraestructure.Adapters.Drivens.Repositories;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Order;

import reactor.core.publisher.Flux;

public interface OrderRepository extends ReactiveMongoRepository<Order, String> {
    Flux<Order> findAllByClerkIdAndIsPaidTrueOrderByCreatedAtDesc(String clerkId);
}
