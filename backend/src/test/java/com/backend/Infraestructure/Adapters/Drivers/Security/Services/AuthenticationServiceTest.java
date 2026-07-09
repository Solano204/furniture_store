package com.backend.Infraestructure.Adapters.Drivers.Security.Services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Token;
import com.backend.Infraestructure.Adapters.Drivens.Entities.User;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.TokenRepository;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.UserRepository;
import com.backend.Infraestructure.Adapters.Drivers.Security.GraphQLCustomException;
import com.backend.Infraestructure.Adapters.Drivers.Security.Roles.Role;
import com.backend.Infraestructure.Adapters.Drivers.Security.Roles.UserRole;

import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private ReactiveAuthenticationManager authenticationManager;

    private AuthenticationService authenticationService;

    @BeforeEach
    void setUp() {
        authenticationService = new AuthenticationService(
                userRepository, tokenRepository, passwordEncoder, jwtService, authenticationManager);
        lenient().when(tokenRepository.save(any(Token.class))).thenReturn(Mono.just(Token.builder().build()));
        lenient().when(tokenRepository.deleteAllByUser(any())).thenReturn(Mono.empty());
    }

    private User buildUser() {
        return User.builder()
                .id("u1")
                .username("carlos")
                .password("encoded-pw")
                .permissions(Set.of(new Role(UserRole.USER)))
                .build();
    }

    @Test
    void register_rejectsDuplicateUsername() {
        when(userRepository.existsByUsername("carlos")).thenReturn(Mono.just(true));

        StepVerifier.create(authenticationService.register(
                        new DocumentMappings.RegisterRequests("carlos", "pw", "USER")))
                .expectErrorMatches(err -> err instanceof GraphQLCustomException
                        && ((GraphQLCustomException) err).getErrorCode().equals("Username_ALREADY_EXISTS"))
                .verify();
    }

    @Test
    void register_defaultsToUserRoleWhenRoleInvalid() {
        User saved = buildUser();
        when(userRepository.existsByUsername("carlos")).thenReturn(Mono.just(false));
        when(passwordEncoder.encode("pw")).thenReturn("encoded-pw");
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(saved));
        when(jwtService.generateToken(saved)).thenReturn(Mono.just("access-token"));
        when(jwtService.generateRefreshToken(saved)).thenReturn(Mono.just("refresh-token"));

        StepVerifier.create(authenticationService.register(
                        new DocumentMappings.RegisterRequests("carlos", "pw", "not-a-real-role")))
                .assertNext(response -> {
                    assertEquals("access-token", response.accessToken());
                    assertEquals("refresh-token", response.refreshToken());
                    assertEquals("u1", response.clerkId());
                })
                .verifyComplete();
    }

    @Test
    void authenticate_wrongPassword_isRejected() {
        User existing = buildUser();
        when(userRepository.findByUsername("carlos")).thenReturn(Mono.just(existing));
        when(passwordEncoder.matches("wrong", "encoded-pw")).thenReturn(false);

        StepVerifier.create(authenticationService.authenticate(
                        new DocumentMappings.AuthenticationRequest("carlos", "wrong")))
                .expectErrorMatches(err -> err instanceof GraphQLCustomException
                        && ((GraphQLCustomException) err).getErrorCode().equals("INVALID_CREDENTIALS"))
                .verify();
    }

    @Test
    void authenticate_unknownUser_isRejected() {
        when(userRepository.findByUsername("ghost")).thenReturn(Mono.empty());

        StepVerifier.create(authenticationService.authenticate(
                        new DocumentMappings.AuthenticationRequest("ghost", "pw")))
                .expectErrorMatches(err -> err instanceof GraphQLCustomException
                        && ((GraphQLCustomException) err).getErrorCode().equals("USER_NOT_FOUND"))
                .verify();
    }

    @Test
    void authenticate_correctPassword_returnsTokens() {
        User existing = buildUser();
        when(userRepository.findByUsername("carlos")).thenReturn(Mono.just(existing));
        when(passwordEncoder.matches("pw", "encoded-pw")).thenReturn(true);
        when(jwtService.generateToken(existing)).thenReturn(Mono.just("access-token"));
        when(jwtService.generateRefreshToken(existing)).thenReturn(Mono.just("refresh-token"));

        StepVerifier.create(authenticationService.authenticate(
                        new DocumentMappings.AuthenticationRequest("carlos", "pw")))
                .assertNext(response -> {
                    assertEquals("access-token", response.accessToken());
                    assertEquals("u1", response.clerkId());
                })
                .verifyComplete();
    }

    @Test
    void refreshToken_blankToken_returnsFalseWithoutTouchingRepositories() {
        StepVerifier.create(authenticationService.refreshToken(""))
                .expectNext(false)
                .verifyComplete();
    }

    @Test
    void refreshToken_invalidToken_returnsFalse() {
        User existing = buildUser();
        when(jwtService.extractUsername("bad-token")).thenReturn(Mono.just("carlos"));
        when(userRepository.findByUsername("carlos")).thenReturn(Mono.just(existing));
        when(jwtService.isTokenValid("bad-token", existing)).thenReturn(Mono.just(false));

        StepVerifier.create(authenticationService.refreshToken("bad-token"))
                .expectNext(false)
                .verifyComplete();
    }

    @Test
    void refreshToken_validToken_rotatesAccessTokenAndReturnsTrue() {
        User existing = buildUser();
        when(jwtService.extractUsername("good-token")).thenReturn(Mono.just("carlos"));
        when(userRepository.findByUsername("carlos")).thenReturn(Mono.just(existing));
        when(jwtService.isTokenValid("good-token", existing)).thenReturn(Mono.just(true));
        when(jwtService.generateToken(existing)).thenReturn(Mono.just("new-access-token"));

        StepVerifier.create(authenticationService.refreshToken("good-token"))
                .expectNext(true)
                .verifyComplete();
    }

    @Test
    void refreshToken_unknownUser_returnsFalse() {
        when(jwtService.extractUsername("token-for-ghost")).thenReturn(Mono.just("ghost"));
        when(userRepository.findByUsername("ghost")).thenReturn(Mono.empty());

        StepVerifier.create(authenticationService.refreshToken("token-for-ghost"))
                .expectNext(false)
                .verifyComplete();
    }
}
