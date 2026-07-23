package com.backend.Infraestructure.Adapters.Drivers.Security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;

import com.backend.Infraestructure.Adapters.Drivens.Graphql.GraphQlPros;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.TokenRepository;
import com.backend.Infraestructure.Adapters.Drivers.Security.Services.JwtService;
import com.backend.Infraestructure.Adapters.Drivers.Security.Services.LogoutService;

import graphql.language.Document;
import graphql.language.OperationDefinition;
import graphql.parser.Parser;

/**
 * Regression coverage for the auth-bypass fixed in GraphQlSecurityInterceptor:
 * the previous implementation decided "is this operation public" by a plain
 * substring search over the raw document text, so a GraphQL comment (or a
 * second field in the same document) naming a public operation let an
 * unrelated protected operation ride through unauthenticated.
 */
@ExtendWith(MockitoExtension.class)
class GraphQlSecurityInterceptorTest {

    @Mock
    private JwtService jwtService;
    @Mock
    private ReactiveUserDetailsService userDetailsService;
    @Mock
    private TokenRepository tokenRepository;
    @Mock
    private LogoutService logoutService;

    private GraphQlSecurityInterceptor interceptor;

    @BeforeEach
    void setUp() {
        GraphQlPros properties = new GraphQlPros();
        properties.setQueriesToCheck(List.of("getFeaturedProducts", "getProductById"));
        properties.setMutationsToCheck(List.of("register", "authenticate", "refreshToken"));
        properties.setAdminOperations(List.of("createProduct", "deleteProduct", "getOrders"));
        interceptor = new GraphQlSecurityInterceptor(
                jwtService, userDetailsService, tokenRepository, logoutService, properties);
    }

    private OperationDefinition parseSingleOperation(String document) {
        Document parsed = new Parser().parseDocument(document);
        return interceptor.selectOperation(parsed, null);
    }

    @Test
    void singlePublicQuery_isRecognizedAsPublic() {
        OperationDefinition op = parseSingleOperation("query { getFeaturedProducts { id } }");
        Set<String> fields = interceptor.topLevelFieldNames(op);

        assertEquals(Set.of("getFeaturedProducts"), fields);
        assertTrue(interceptor.isPublicOperation(false, fields));
    }

    @Test
    void commentMentioningPublicMutation_doesNotSmugglePrivateMutationThrough() {
        String document = "mutation {\n  # register\n  deleteProduct(productId: \"victim-id\") { id }\n}";
        OperationDefinition op = parseSingleOperation(document);
        Set<String> fields = interceptor.topLevelFieldNames(op);

        assertEquals(Set.of("deleteProduct"), fields);
        assertFalse(interceptor.isPublicOperation(true, fields));
    }

    @Test
    void combiningPublicAndProtectedMutationInOneDocument_isNotPublic() {
        String document = "mutation {\n"
                + "  refreshToken(refreshToken: \"x\")\n"
                + "  createProduct(input: {name: \"n\", description: \"d\", image: \"i\", clerkId: \"c\", company: \"co\", price: 1}) { id }\n"
                + "}";
        OperationDefinition op = parseSingleOperation(document);
        Set<String> fields = interceptor.topLevelFieldNames(op);

        assertEquals(Set.of("refreshToken", "createProduct"), fields);
        assertFalse(interceptor.isPublicOperation(true, fields));
    }

    @Test
    void adminOperations_areFlaggedForRoleCheck() {
        assertTrue(interceptor.requiresAdmin(Set.of("deleteProduct")));
        assertTrue(interceptor.requiresAdmin(Set.of("getOrders")));
        assertFalse(interceptor.requiresAdmin(Set.of("createOrder")));
    }
}
