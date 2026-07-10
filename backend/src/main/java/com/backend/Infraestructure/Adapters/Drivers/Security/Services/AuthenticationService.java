package com.backend.Infraestructure.Adapters.Drivers.Security.Services;

import lombok.Data;
import reactor.core.publisher.Mono;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.Infraestructure.Adapters.Drivens.Entities.Token;
import com.backend.Infraestructure.Adapters.Drivens.Entities.User;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.TokenRepository;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.UserRepository;
import com.backend.Infraestructure.Adapters.Drivers.Security.GraphQLCustomException;
import com.backend.Infraestructure.Adapters.Drivers.Security.Roles.Role;
import com.backend.Infraestructure.Adapters.Drivers.Security.Roles.UserRole;
import com.backend.Infraestructure.Adapters.Drivers.Security.token.TokenType;

import java.util.Set;

@Service
@Data
public class AuthenticationService {

  private final UserRepository repository;
  private final TokenRepository tokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final ReactiveAuthenticationManager authenticationManager;

  // This method will be execute when I wanna register a new User and I return a
  // AuthenticationResponse(with Refresh Token and access Token)
  public Mono<DocumentMappings.AuthenticationResponse> register(DocumentMappings.RegisterRequests request) {
    return repository.existsByUsername(request.username())
        .flatMap(exists -> {
            if (exists) {
                throw new GraphQLCustomException(
                    "Username already exists",
                    "Username_ALREADY_EXISTS",
                    "The Username '" + request.username() + "' is already registered. Please use a different Username."
                );
            }        
            // Self-registration always creates a plain USER account - role is never
            // taken from client input, or anyone could register as ADMIN.
            var user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .permissions(Set.of(new Role(UserRole.USER)))
                .build();

            // Save user reactively and generate tokens
            return repository.save(user)
                .flatMap(savedUser -> {
                    // Generate tokens reactively
                    return Mono.zip(
                        jwtService.generateToken(savedUser),
                        jwtService.generateRefreshToken(savedUser)
                    ).flatMap(tokens -> {
                        // Save tokens reactively
                        String jwtToken = tokens.getT1();
                        String refreshToken = tokens.getT2();
                        return saveUserToken(savedUser, jwtToken)
                            .then(Mono.just(
                                new DocumentMappings.AuthenticationResponse(jwtToken, refreshToken, savedUser.getId())
                            ));
                    });
                });
        });
}

  // This method will be execute when I wanna login and I return a
  // AuthenticationResponse(with Refresh Token and access Token)
  public Mono<DocumentMappings.AuthenticationResponse> authenticate(DocumentMappings.AuthenticationRequest request) {
    // Find user by Username reactively
    return repository.findByUsername(request.username())
        .switchIfEmpty(Mono.error(new GraphQLCustomException(
            "User not found",
            "USER_NOT_FOUND",
            "The Username provided is not registered."
        )))
        .flatMap(user -> {
            // Check if the provided password matches the stored password
            if (!passwordEncoder.matches(request.password(), user.getPassword())) {
                return Mono.error(new GraphQLCustomException(
                    "Invalid credentials",
                    "INVALID_CREDENTIALS",
                    "The Username or password provided is incorrect."
                ));
            }

            // If password is valid, generate access and refresh tokens
            return Mono.zip(
                    jwtService.generateToken(user),  // Generate access token
                    jwtService.generateRefreshToken(user)  // Generate refresh token
                )
                .flatMap(tokens -> {
                    String jwtToken = tokens.getT1();
                    String refreshToken = tokens.getT2();

                    // Revoke previous tokens and save the new one reactively
                    return revokeAllUserTokens(user) // Revoke old tokens reactively
                        .then(saveUserToken(user, jwtToken)) // Save the new token reactively
                        .then(Mono.just(new DocumentMappings.AuthenticationResponse(jwtToken, refreshToken,user.getId()))); // Return the auth response
                });
        });
}




  // Here i save the token in the database
  private Mono<Void> saveUserToken(User user, String jwtToken) {
    var token = Token.builder()
        .user(user.getUsername())
        .token(jwtToken)
        .tokenType(TokenType.BEARER)
        .build();

    // Save token reactively and return Mono<Void>
    return tokenRepository.save(token).then(); 
}


  // Here I put all my token like Invalid and Revoked or Expired
  private Mono<Void> revokeAllUserTokens(User user) {
    return tokenRepository.deleteAllByUser(user.getUsername())
        .doOnSuccess(unused -> System.out.println("All tokens revoked for user: " + user.getUsername()))
        .doOnError(error -> System.err.println("Failed to revoke tokens for user: " + user.getUsername() + ", error: " + error.getMessage()));
  } 

  // Validates a refresh token and, if valid, rotates it for a new access token.
  // Takes the raw token string directly - the GraphQL mutation
  // (refreshToken(refreshToken: String!): Boolean!) hands one straight through,
  // there's no HTTP request to pull an Authorization header out of.
  public Mono<Boolean> refreshToken(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) {
        return Mono.just(false);
    }

    return jwtService.extractUsername(refreshToken)
        .flatMap(username -> {
            if (username == null) {
                return Mono.just(false);
            }

            return repository.findByUsername(username)
                .flatMap(user -> jwtService.isTokenValid(refreshToken, user)
                    .flatMap(isValid -> {
                        if (!isValid) {
                            return Mono.just(false);
                        }
                        return jwtService.generateToken(user)
                            .flatMap(accessToken -> revokeAllUserTokens(user)
                                .then(saveUserToken(user, accessToken))
                                .thenReturn(true));
                    }))
                .switchIfEmpty(Mono.just(false));
        })
        .switchIfEmpty(Mono.just(false))
        .onErrorReturn(false);
}
}