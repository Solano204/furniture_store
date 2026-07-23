package com.backend.Infraestructure.Adapters.Drivers.Security.Services;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.backend.Infraestructure.Adapters.Drivens.Entities.User;
import com.backend.Infraestructure.Adapters.Drivers.Security.Roles.Role;
import com.backend.Infraestructure.Adapters.Drivers.Security.Roles.UserRole;

import reactor.test.StepVerifier;

// No dedicated coverage previously existed for isTokenValid/generateToken -
// these were only exercised indirectly through AuthenticationServiceTest with
// jwtService mocked out. @Value fields are set via reflection since this is a
// plain unit test, not a Spring context test.
class JwtServiceTest {

    private static final String TEST_SECRET =
            "dGVzdC1qd3Qtc2VjcmV0LWtleS1mb3ItdW5pdC10ZXN0cy1vbmx5LW5vdC1wcm9kLTMyYnl0ZXM=";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 60_000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 604_800_000L);
    }

    private User buildUser(String username) {
        return User.builder()
                .id("u1")
                .username(username)
                .password("encoded-pw")
                .permissions(Set.of(new Role(UserRole.USER)))
                .build();
    }

    @Test
    void generateToken_thenExtractUsername_roundTrips() {
        User user = buildUser("carlos");
        String token = jwtService.generateToken(user).block();

        StepVerifier.create(jwtService.extractUsername(token))
                .expectNext("carlos")
                .verifyComplete();
    }

    @Test
    void isTokenValid_matchingUsernameAndNotExpired_isTrue() {
        User user = buildUser("carlos");
        String token = jwtService.generateToken(user).block();

        StepVerifier.create(jwtService.isTokenValid(token, user))
                .expectNext(true)
                .verifyComplete();
    }

    @Test
    void isTokenValid_tokenBelongsToDifferentUser_isFalse() {
        User owner = buildUser("carlos");
        User impersonator = buildUser("mallory");
        String token = jwtService.generateToken(owner).block();

        StepVerifier.create(jwtService.isTokenValid(token, impersonator))
                .expectNext(false)
                .verifyComplete();
    }

    @Test
    void isTokenValid_expiredToken_isFalse() {
        User user = buildUser("carlos");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -60_000L);
        String token = jwtService.generateToken(user).block();

        StepVerifier.create(jwtService.isTokenValid(token, user))
                .expectNext(false)
                .verifyComplete();
    }
}
