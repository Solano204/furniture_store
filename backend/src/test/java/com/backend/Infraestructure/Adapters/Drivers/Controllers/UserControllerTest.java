package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.Infraestructure.Adapters.Drivens.Entities.User;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings.ChangePasswordRequest;
import com.backend.Infraestructure.Adapters.Drivers.Security.GraphQLCustomException;
import com.backend.Infraestructure.Adapters.Drivers.Security.OwnershipGuard;
import com.backend.Infraestructure.Adapters.Drivers.Security.user.UserService;

import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

// getInfoUser used to have no ownership check at all: any authenticated user
// could pass another user's username and read their profile.
@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService service;

    @Mock
    private OwnershipGuard ownershipGuard;

    private UserController userController;

    @BeforeEach
    void setUp() {
        userController = new UserController(service, ownershipGuard);
    }

    @Test
    void getInfoUser_callerRequestsOwnUsername_returnsUser() {
        User user = User.builder().id("u1").username("carlos").build();
        when(ownershipGuard.currentUsername()).thenReturn(Mono.just("carlos"));
        when(service.findByUsername("carlos")).thenReturn(Mono.just(user));

        StepVerifier.create(userController.user("carlos"))
                .expectNext(user)
                .verifyComplete();
    }

    @Test
    void getInfoUser_callerRequestsSomeoneElsesUsername_isForbidden() {
        when(ownershipGuard.currentUsername()).thenReturn(Mono.just("carlos"));

        StepVerifier.create(userController.user("someone-else"))
                .expectErrorMatches(err -> err instanceof GraphQLCustomException
                        && ((GraphQLCustomException) err).getErrorCode().equals("FORBIDDEN"))
                .verify();

        verify(service, never()).findByUsername(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void changePassword_delegatesToServiceWithAuthenticatedUsername() {
        ChangePasswordRequest request = new ChangePasswordRequest("carlos", "old", "new", "new");
        when(ownershipGuard.currentUsername()).thenReturn(Mono.just("carlos"));
        when(service.changePassword(request, "carlos")).thenReturn(Mono.just("Password changed successfully"));

        StepVerifier.create(userController.changePassword(request))
                .expectNext("Password changed successfully")
                .verifyComplete();
    }
}
