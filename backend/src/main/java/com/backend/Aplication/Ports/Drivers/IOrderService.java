package com.backend.Aplication.Ports.Drivers;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Order;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface IOrderService {
    Mono<Order> createOrder(DocumentMappings.CreateOrderInput input);

    Flux<Order> getUserOrders(String clerkId);

    Flux<Order> getOrders();
}
