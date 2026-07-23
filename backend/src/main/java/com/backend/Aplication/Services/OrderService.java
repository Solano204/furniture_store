package com.backend.Aplication.Services;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.backend.Aplication.Ports.Drivers.IOrderService;
import com.backend.Infraestructure.Adapters.Drivens.Entities.Order;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.OrderRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OrderService implements IOrderService {

    private final OrderRepository orderRepository;

    @Override
    public Mono<Order> createOrder(DocumentMappings.CreateOrderInput input) {
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

    @Override
    public Flux<Order> getUserOrders(String clerkId) {
        return orderRepository.findAllByClerkIdAndIsPaidTrueOrderByCreatedAtDesc(clerkId);
    }

    @Override
    public Flux<Order> getOrders() {
        return orderRepository.findAll();
    }
}
