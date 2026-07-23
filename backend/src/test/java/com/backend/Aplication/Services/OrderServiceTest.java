package com.backend.Aplication.Services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Order;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.OrderRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository);
    }

    @Test
    void createOrder_mapsInputFieldsOntoNewOrder() {
        DocumentMappings.CreateOrderInput input = new DocumentMappings.CreateOrderInput(
                "clerk-1", 3, new BigDecimal("150.00"), new BigDecimal("10.00"),
                new BigDecimal("5.00"), "carlos");
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> Mono.just(inv.getArgument(0)));

        StepVerifier.create(orderService.createOrder(input))
                .assertNext(order -> {
                    assertEquals("clerk-1", order.getClerkId());
                    assertEquals(3, order.getProducts());
                    assertEquals(new BigDecimal("150.00"), order.getOrderTotal());
                    assertEquals("carlos", order.getUsername());
                })
                .verifyComplete();
    }

    @Test
    void getUserOrders_delegatesToRepository() {
        when(orderRepository.findAllByClerkIdAndIsPaidTrueOrderByCreatedAtDesc("clerk-1"))
                .thenReturn(Flux.just(new Order()));

        StepVerifier.create(orderService.getUserOrders("clerk-1"))
                .expectNextCount(1)
                .verifyComplete();
    }

    @Test
    void getOrders_returnsAllOrders() {
        when(orderRepository.findAll()).thenReturn(Flux.just(new Order(), new Order()));

        StepVerifier.create(orderService.getOrders())
                .expectNextCount(2)
                .verifyComplete();
    }
}
