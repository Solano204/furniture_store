package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Order;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings.CreateOrderInput;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.OrderRepository;

import lombok.Data;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@Data
public class OrderController {

    private final OrderRepository orderRepository;

    @MutationMapping(name = "createOrder")
    public Mono<Order> createOrder(@Argument(name = "input") DocumentMappings.CreateOrderInput input) {
        Order order = new Order();
        order.setClerkId(input.clerkId());
        order.setProducts(input.products());
        order.setOrderTotal(input.orderTotal());
        order.setTax(input.tax());
        order.setShipping(input.shipping());
        order.setUsername(input.username());
        order.setCreatedAt(LocalDate.now());
        order.setUpdatedAt(LocalDate.now());
        return orderRepository.save(order);
    }

    @QueryMapping(name = "getUserOrders")
    public Flux <Order> getUserOrders(@Argument(name = "clerkId") String clerkId) {
        return orderRepository.findAllByClerkIdAndIsPaidTrueOrderByCreatedAtDesc(clerkId);
    }
    @QueryMapping(name = "getOrders")
    public Flux <Order> getOrders() {
        return orderRepository.findAll();
    }

}
