package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.backend.Infraestructure.Adapters.Drivens.Entities.User;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings.ChangePasswordRequest;
import com.backend.Infraestructure.Adapters.Drivers.Security.GraphQLCustomException;
import com.backend.Infraestructure.Adapters.Drivers.Security.OwnershipGuard;
import com.backend.Infraestructure.Adapters.Drivers.Security.user.UserService;

@Controller
@RequiredArgsConstructor
public class UserController {

    private final UserService service;
    private final OwnershipGuard ownershipGuard;

    @MutationMapping(name = "changePassword")
    public Mono<String> changePassword(
            @Argument(name = "input") ChangePasswordRequest request) {
        // The account whose password changes is always the authenticated caller,
        // never request.username() - the input's username is only used to look
        // up which user, everything else is validated against the caller.
        return ownershipGuard.currentUsername()
                .flatMap(username -> service.changePassword(request, username));
    }

    // GraphQlSecurityInterceptor only proves the caller is authenticated as
    // *someone* - without this, any logged-in user could pass another user's
    // username and read their profile. Mirrors OwnershipGuard#verifyOwnClerkId.
    @QueryMapping(name = "getInfoUser")
    public Mono<User> user(@Argument(name = "username") String username) {
        return ownershipGuard.currentUsername()
                .flatMap(callerUsername -> {
                    if (!callerUsername.equals(username)) {
                        return Mono.<User>error(new GraphQLCustomException(
                                "Forbidden",
                                "FORBIDDEN",
                                "You are not allowed to access another user's data."));
                    }
                    return service.findByUsername(username);
                });
    }
}
