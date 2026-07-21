package com.backend.Infraestructure.Adapters.Drivers.Security;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.backend.Infraestructure.Adapters.Drivens.Graphql.GraphQlPros;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.TokenRepository;
import com.backend.Infraestructure.Adapters.Drivers.Security.Services.JwtService;
import com.backend.Infraestructure.Adapters.Drivers.Security.Services.LogoutService;

import graphql.language.Document;
import graphql.language.Field;
import graphql.language.OperationDefinition;
import graphql.language.Selection;
import graphql.parser.Parser;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class GraphQlSecurityInterceptor implements WebGraphQlInterceptor {

    private final JwtService jwtService;
    private final ReactiveUserDetailsService userDetailsService;
    private final TokenRepository tokenRepository;
    private final LogoutService logoutService;
    private final GraphQlPros graphQlProperties;

    @Override
    public Mono<WebGraphQlResponse> intercept(WebGraphQlRequest request, Chain chain) {
        OperationDefinition operation;
        try {
            operation = selectOperation(new Parser().parseDocument(request.getDocument()), request.getOperationName());
        } catch (Exception e) {
            return Mono.error(new GraphQLCustomException(
                    "Invalid query", "INVALID_QUERY", "The submitted GraphQL document could not be parsed."));
        }

        if (operation == null) {
            return Mono.error(new GraphQLCustomException(
                    "Invalid query", "INVALID_QUERY", "No executable operation found in the request."));
        }

        Set<String> requestedFields = topLevelFieldNames(operation);
        boolean isMutation = operation.getOperation() == OperationDefinition.Operation.MUTATION;

        // Logout revokes the caller's own current token straight from the
        // Authorization header, so it's handled before the generic public/auth
        // checks - but only when it's the sole requested field. Combining it
        // with other fields in one document falls through to the normal auth
        // path instead of getting a free pass.
        if (isMutation && requestedFields.equals(Set.of("logout"))) {
            return logoutService.logout(request)
                    .flatMap(success -> {
                        if (success) {
                            return chain.next(request);
                        }
                        return Mono.error(new GraphQLCustomException(
                                "Logout failed",
                                "LOGOUT_FAILED",
                                "An error occurred while logging out. Please try again."));
                    })
                    .switchIfEmpty(Mono.error(new GraphQLCustomException(
                            "Logout failed",
                            "LOGOUT_FAILED",
                            "An error occurred while logging out. Please try again.")));
        }

        if (isPublicOperation(isMutation, requestedFields)) {
            return chain.next(request);
        }

        // Extract Authorization header
        String bearer = request.getHeaders().getFirst("Authorization");

        if (bearer == null || !bearer.startsWith("Bearer ")) {
            return Mono.error(new SecurityException("Unauthorized: Missing or invalid Authorization header"));
        }

        // Extract token
        String incomingToken = bearer.substring(7);

        // Validate and check if token exists in the database. An expired,
        // malformed, or tampered token makes the JJWT parser throw here (this
        // is the most common auth failure in practice - access tokens expire
        // every 24h by default) - map it to the same clean auth error other
        // failures in this method use, instead of leaking a raw parser
        // exception message through CustomGraphQLExceptionResolver's fallback.
        return jwtService.extractUsername(incomingToken)
                .onErrorMap(ex -> !(ex instanceof GraphQLCustomException), ex -> new GraphQLCustomException(
                        "Invalid credentials",
                        "INVALID_CREDENTIALS",
                        "Your session has expired or the token is invalid. Please log in again."))
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
                                                if (!isValid) {
                                                    return Mono.error(new GraphQLCustomException(
                                                            "Invalid credentials",
                                                            "INVALID_CREDENTIALS",
                                                            "Try again"));
                                                }

                                                if (requiresAdmin(requestedFields) && !isAdmin(userDetails)) {
                                                    return Mono.error(new GraphQLCustomException(
                                                            "Forbidden",
                                                            "FORBIDDEN",
                                                            "This operation requires administrator privileges."));
                                                }

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
                                            });
                                })));
    }

    // Resolves which operation actually executes: the one matching
    // WebGraphQlRequest#getOperationName() when the document defines several,
    // or the sole operation when there's only one and none was named. Returns
    // null rather than guessing when that's ambiguous.
    // Package-private (not private) so GraphQlSecurityInterceptorTest can drive
    // the parsing/allow-list decisions directly without standing up a full
    // WebGraphQlRequest/Spring context.
    OperationDefinition selectOperation(Document document, String operationName) {
        List<OperationDefinition> operations = document.getDefinitions().stream()
                .filter(OperationDefinition.class::isInstance)
                .map(OperationDefinition.class::cast)
                .collect(Collectors.toList());

        if (operationName != null && !operationName.isBlank()) {
            return operations.stream()
                    .filter(op -> operationName.equals(op.getName()))
                    .findFirst()
                    .orElse(null);
        }
        return operations.size() == 1 ? operations.get(0) : null;
    }

    // Only counts direct Field selections at the operation root - a fragment
    // spread or inline fragment there makes the set unresolvable, which fails
    // closed (treated as non-public, auth required) instead of guessing.
    Set<String> topLevelFieldNames(OperationDefinition operation) {
        Set<String> names = new LinkedHashSet<>();
        for (Selection selection : operation.getSelectionSet().getSelections()) {
            if (selection instanceof Field field) {
                names.add(field.getName());
            } else {
                return Set.of();
            }
        }
        return names;
    }

    // Public only if EVERY requested top-level field is on the allow-list -
    // a document combining one public field with a protected one (whether via
    // a real multi-field operation or a "# register"-style comment trick that
    // used to fool the old substring search) no longer gets a free pass.
    boolean isPublicOperation(boolean isMutation, Set<String> requestedFields) {
        if (requestedFields.isEmpty()) {
            return false;
        }
        List<String> allowList = isMutation ? graphQlProperties.getMutationsToCheck() : graphQlProperties.getQueriesToCheck();
        return allowList != null && allowList.containsAll(requestedFields);
    }

    boolean requiresAdmin(Set<String> requestedFields) {
        List<String> adminOperations = graphQlProperties.getAdminOperations();
        return adminOperations != null && requestedFields.stream().anyMatch(adminOperations::contains);
    }

    private boolean isAdmin(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
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
