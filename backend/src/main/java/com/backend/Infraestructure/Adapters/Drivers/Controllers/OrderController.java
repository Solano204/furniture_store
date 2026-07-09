package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.backend.Aplication.Ports.Drivers.IOrderService;
import com.backend.Infraestructure.Adapters.Drivens.Entities.Order;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class OrderController {

    private final IOrderService orderService;

    @MutationMapping(name = "createOrder")
    public Mono<Order> createOrder(@Argument(name = "input") DocumentMappings.CreateOrderInput input) {
        return orderService.createOrder(input);
    }

    @QueryMapping(name = "getUserOrders")
    public Flux<Order> getUserOrders(@Argument(name = "clerkId") String clerkId) {
        return orderService.getUserOrders(clerkId);
    }

    @QueryMapping(name = "getOrders")
    public Flux<Order> getOrders() {
        return orderService.getOrders();
    }
}
