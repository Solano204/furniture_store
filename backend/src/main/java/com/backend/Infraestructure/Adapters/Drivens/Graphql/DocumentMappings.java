package com.backend.Infraestructure.Adapters.Drivens.Graphql;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;


public class DocumentMappings {

    // Input Records
    public record  CreateProductInput(
            String name,
            String description,
            String image,
            String clerkId,
            String company,
            Integer price) {
    }

    public record UpdateProductInput(
            String name,
            String description,
            String company,
            Integer price) {
    }

    public record AddFavoriteInput(
            String productId,
            String clerkId) {
    }

    public record CreateReviewInput(
            String productId,
            String authorName,
            String authorImageUrl,
            Integer rating,
            String comment,
            String clerkId) {
    }

    public record CreateOrderInput(
            String clerkId,
            Integer products,
            BigDecimal orderTotal,
            BigDecimal tax,
            BigDecimal shipping,
            String username) {
    }

    // Output Records
    public record Product(
            String id,
            String name,
            String description,
            String image,
            Integer price,
            String clerkId,
            Boolean featured,
            String createdAt) {
    }

    public record Favorite(
            String id,
            String productId,
            String clerkId,
            Product product) {
    }

    public record Review(
            String id,
            String productId,
            Float rating,
            String comment,
            String clerkId
            ) {
    }

    public record ReviewAggregate(
            String productId,
            Float avgRating,
            Integer ratingCount) {
    }

    public record Order(
            String id,
            String clerkId,
            Integer products,
            BigDecimal orderTotal,
            BigDecimal tax,
            BigDecimal shipping,
            String username,
            String createdAt) {
    }

    public record AuthenticationResponse(
            String accessToken,
            String refreshToken,
            String clerkId) {
    }

    public record AuthenticationRequest(
            String username,
            String password) {
    }

    public record ChangePasswordRequest(
            String username,
            String currentPassword,
            String newPassword,
            String confirmationPassword) {
    }

    public record RegisterRequests(
            String username,
            String password) {
    }

}
