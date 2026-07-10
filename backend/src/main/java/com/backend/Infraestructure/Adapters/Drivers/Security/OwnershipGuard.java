package com.backend.Infraestructure.Adapters.Drivers.Security;

import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;

import com.backend.Infraestructure.Adapters.Drivens.Repositories.UserRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

// GraphQlSecurityInterceptor only proves "this request carries a valid token
// for some user" - it says nothing about whether the clerkId a resolver was
// given as an argument belongs to that user. Without this check, any
// authenticated customer could pass another user's clerkId (visible on public
// review/order data) and read or mutate that user's favorites/orders/reviews.
@Component
@RequiredArgsConstructor
public class OwnershipGuard {

    private final UserRepository userRepository;

    public Mono<String> currentUsername() {
        return ReactiveSecurityContextHolder.getContext()
                .map(context -> context.getAuthentication().getName())
                .switchIfEmpty(Mono.error(new GraphQLCustomException(
                        "Unauthorized",
                        "UNAUTHORIZED",
                        "Could not resolve the authenticated user.")));
    }

    public Mono<String> currentUserId() {
        return currentUsername()
                .flatMap(userRepository::findByUsername)
                .map(user -> user.getId())
                .switchIfEmpty(Mono.error(new GraphQLCustomException(
                        "Unauthorized",
                        "UNAUTHORIZED",
                        "Could not resolve the authenticated user.")));
    }

    public Mono<String> verifyOwnClerkId(String claimedClerkId) {
        return currentUserId()
                .flatMap(actualId -> {
                    if (!actualId.equals(claimedClerkId)) {
                        return Mono.<String>error(new GraphQLCustomException(
                                "Forbidden",
                                "FORBIDDEN",
                                "You are not allowed to access another user's data."));
                    }
                    return Mono.just(actualId);
                });
    }
}
