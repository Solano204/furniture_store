package com.backend.Infraestructure.Adapters.Drivers.Security.Services;

import lombok.Data;
import reactor.core.publisher.Mono;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;

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
            // Convert the role string to UserRole, default to USER if invalid
            UserRole userRole;
            try {
                userRole = UserRole.valueOf(request.role().toUpperCase()); // Convert to uppercase to match enum names
            } catch (IllegalArgumentException | NullPointerException e) {
                userRole = UserRole.USER; // Default role
            }

            // Build the user
            var user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .permissions(Set.of(new Role(userRole)))
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

  // Here I validate the token and the information of the user
  public Mono<ServerResponse> refreshToken(ServerRequest request) {
    return Mono.justOrEmpty(request.headers().firstHeader(HttpHeaders.AUTHORIZATION)) // Extract Authorization header
        .filter(authHeader -> authHeader.startsWith("Bearer ")) // Ensure it starts with "Bearer "
        .flatMap(authHeader -> {
            String refreshToken = authHeader.substring(7); // Remove "Bearer " prefix
            // Extract Username reactively
            return jwtService.extractUsername(refreshToken)
                .flatMap(userUsername -> {
                    if (userUsername == null) {
                        return ServerResponse.badRequest().bodyValue("Invalid refresh token");
                    }

                    // Find user reactively
                    return repository.findByUsername(userUsername)
                        .switchIfEmpty(Mono.error(new RuntimeException("User not found")))
                        .flatMap(user -> jwtService.isTokenValid(refreshToken, user)
                            .flatMap(isValid -> {
                                if (!isValid) {
                                    return ServerResponse.badRequest().bodyValue("Invalid token");
                                }
                                // Generate new access token reactively
                                return jwtService.generateToken(user)
                                    .flatMap(accessToken ->
                                        // Revoke all previous tokens and save the new one - both are
                                        // lazy Monos, so they must be chained (not just called) to
                                        // actually run before the response is built.
                                        revokeAllUserTokens(user)
                                            .then(saveUserToken(user, accessToken))
                                            .then(Mono.defer(() -> {
                                                var authResponse = new DocumentMappings.AuthenticationResponse(
                                                        accessToken, refreshToken, user.getId());
                                                return ServerResponse.ok().bodyValue(authResponse);
                                            })));
                            })
                        );
                });
        })
        .switchIfEmpty(ServerResponse.badRequest().bodyValue("Missing or invalid Authorization header"));
}
}