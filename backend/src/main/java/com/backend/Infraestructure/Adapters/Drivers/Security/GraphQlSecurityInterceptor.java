package com.backend.Infraestructure.Adapters.Drivers.Security;

import java.util.List;

import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.stereotype.Component;

import com.backend.Infraestructure.Adapters.Drivens.Graphql.GraphQlPros;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.TokenRepository;
import com.backend.Infraestructure.Adapters.Drivers.Security.Services.JwtService;
import com.backend.Infraestructure.Adapters.Drivers.Security.Services.LogoutService;

import lombok.Data;
import reactor.core.publisher.Mono;

@Component
@Data
public class GraphQlSecurityInterceptor implements WebGraphQlInterceptor {


    private final JwtService jwtService;
    private final ReactiveUserDetailsService userDetailsService;
    private final TokenRepository tokenRepository;
    private final LogoutService logoutService;
    private final GraphQlPros graphQlProperties;
    // Define a list of queries or mutations to check

    @Override
    public Mono<WebGraphQlResponse> intercept(WebGraphQlRequest request, Chain chain) {
        String document = request.getDocument();
        System.out.println("Document: " + document);

        // Logout: Handle logout operation
        if (document != null && containsAny(document, "mutation", List.of("logout"))) {
            // Perform logout and return an error if it fails
            return logoutService.logout(request)
                    .flatMap(success -> {
                        if (success) {
                            return chain.next(request); // Continue if logout is successful
                        } else {
                            return Mono.error(new GraphQLCustomException(
                                    "Logout failed",
                                    "LOGOUT_FAILED",
                                    "An error occurred while logging out. Please try again."));
                        }
                    })
                    .switchIfEmpty(Mono.error(new GraphQLCustomException(
                            "Logout failed",
                            "LOGOUT_FAILED",
                            "An error occurred while logging out. Please try again.")));
        }

        // Check for queries
        if (document != null && containsAny(document, "query", graphQlProperties.getQueriesToCheck())) {
            System.out.println("Query Detected: " + document);
            return chain.next(request);
        }
        
        if (document != null && containsAny(document, "mutation", graphQlProperties.getMutationsToCheck())) {
            System.out.println("Mutation Detected: " + document);
            return chain.next(request);
        }
        

        // Extract Authorization header
        String bearer = request.getHeaders().getFirst("Authorization");

        if (bearer == null || !bearer.startsWith("Bearer ")) {
            return Mono.error(new SecurityException("Unauthorized: Missing or invalid Authorization header"));
        }

        // Extract token
        String incomingToken = bearer.substring(7);

        // Validate and check if token exists in the database
        return jwtService.extractUsername(incomingToken)
                .flatMap(userName -> userDetailsService.findByUsername(userName)
                        .flatMap(userDetails -> tokenRepository.existsByToken(incomingToken)
                                .flatMap(exists -> {
                                    if (!exists) {
                                        return Mono.error(new GraphQLCustomException(
                                                "Invalid credentials",
                                                "INVALID_CREDENTIALS",
                                                "Try again"));
                                    }

                                    // Token exists, now validate it
                                    return jwtService.isTokenValid(incomingToken, userDetails)
                                            .flatMap(isValid -> {
                                                if (isValid) {
                                                    // Set authentication context
                                                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                                            userDetails,
                                                            null,
                                                            userDetails.getAuthorities());

                                                    // Set custom details if necessary
                                                    authToken.setDetails(new CustomAuthenticationDetails(request));
                                                    return chain.next(request)
                                                            .contextWrite(ReactiveSecurityContextHolder
                                                                    .withAuthentication(authToken));
                                                } else {
                                                    return Mono.error(new GraphQLCustomException(
                                                            "Invalid credentials",
                                                            "INVALID_CREDENTIALS",
                                                            "Try again"));
                                                }
                                            });
                                })));
    }

    // Helper method to check if the document contains a specific type and any
    // keyword
    private boolean containsAny(String document, String type, List<String> keywords) {
        if (document == null || type == null || keywords == null || keywords.isEmpty()) {
            return false;
        }
    
        String lowerCaseDocument = document.toLowerCase();
        String lowerCaseType = type.toLowerCase();
    
        if (type.equalsIgnoreCase("query") && !lowerCaseDocument.startsWith("mutation")) {
            // If the document does not explicitly start with "mutation", treat it as a query.
            for (String keyword : keywords) {
                if (lowerCaseDocument.contains(keyword.toLowerCase())) {
                    return true;
                }
            }
        }
    
        if (lowerCaseDocument.contains(lowerCaseType)) {
            for (String keyword : keywords) {
                if (lowerCaseDocument.contains(keyword.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    }
    

    // Custom AuthenticationDetails class for GraphQL requests
    public static class CustomAuthenticationDetails {
        private final WebGraphQlRequest request;

        public CustomAuthenticationDetails(WebGraphQlRequest request) {
            this.request = request;
        }

        // You can add custom fields based on your needs
        public WebGraphQlRequest getRequest() {
            return request;
        }
    }
}
