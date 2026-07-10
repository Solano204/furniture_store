package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.backend.Aplication.Ports.Drivers.IOrderService;
import com.backend.Infraestructure.Adapters.Drivens.Entities.Order;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivers.Security.OwnershipGuard;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class OrderController {

    private final IOrderService orderService;
    private final OwnershipGuard ownershipGuard;

    @MutationMapping(name = "createOrder")
    public Mono<Order> createOrder(@Argument(name = "input") DocumentMappings.CreateOrderInput input) {
        return ownershipGuard.verifyOwnClerkId(input.clerkId())
                .then(orderService.createOrder(input));
    }

    @QueryMapping(name = "getUserOrders")
    public Flux<Order> getUserOrders(@Argument(name = "clerkId") String clerkId) {
        return ownershipGuard.verifyOwnClerkId(clerkId).thenMany(orderService.getUserOrders(clerkId));
    }

    // Admin-only - enforced by GraphQlSecurityInterceptor (graphql.admin-operations),
    // since this returns every user's orders, not just the caller's.
    @QueryMapping(name = "getOrders")
    public Flux<Order> getOrders() {
        return orderService.getOrders();
    }
}
