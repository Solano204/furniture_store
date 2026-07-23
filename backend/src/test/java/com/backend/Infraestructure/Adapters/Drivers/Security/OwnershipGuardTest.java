package com.backend.Infraestructure.Adapters.Drivers.Security;

import static org.mockito.Mockito.when;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;

import com.backend.Infraestructure.Adapters.Drivens.Entities.User;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.UserRepository;

import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import reactor.util.context.Context;

@ExtendWith(MockitoExtension.class)
class OwnershipGuardTest {

    @Mock
    private UserRepository userRepository;

    private OwnershipGuard ownershipGuard;

    @BeforeEach
    void setUp() {
        ownershipGuard = new OwnershipGuard(userRepository);
    }

    private Context authenticatedAs(String username) {
        var auth = new UsernamePasswordAuthenticationToken(username, null, Set.of());
        return ReactiveSecurityContextHolder.withAuthentication(auth);
    }

    @Test
    void verifyOwnClerkId_matchingCaller_passes() {
        User user = User.builder().id("u1").username("carlos").build();
        when(userRepository.findByUsername("carlos")).thenReturn(Mono.just(user));

        StepVerifier.create(ownershipGuard.verifyOwnClerkId("u1").contextWrite(authenticatedAs("carlos")))
                .expectNext("u1")
                .verifyComplete();
    }

    @Test
    void verifyOwnClerkId_mismatchedClerkId_isForbidden() {
        User user = User.builder().id("u1").username("carlos").build();
        when(userRepository.findByUsername("carlos")).thenReturn(Mono.just(user));

        StepVerifier.create(ownershipGuard.verifyOwnClerkId("someone-elses-id").contextWrite(authenticatedAs("carlos")))
                .expectErrorMatches(err -> err instanceof GraphQLCustomException
                        && ((GraphQLCustomException) err).getErrorCode().equals("FORBIDDEN"))
                .verify();
    }

    @Test
    void currentUserId_noSecurityContext_isUnauthorized() {
        StepVerifier.create(ownershipGuard.currentUserId())
                .expectErrorMatches(err -> err instanceof GraphQLCustomException
                        && ((GraphQLCustomException) err).getErrorCode().equals("UNAUTHORIZED"))
                .verify();
    }
}
