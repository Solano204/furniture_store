package com.backend.Infraestructure.Adapters.Drivens.Repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Order;

import reactor.core.publisher.Flux;

import java.util.List;

public interface OrderRepository extends ReactiveMongoRepository<Order, String> {
    Flux<Order> findByClerkIdAndIsPaidTrue(String clerkId);

    Flux<Order> findAllByClerkIdAndIsPaidTrueOrderByCreatedAtDesc(String clerkId);
}
