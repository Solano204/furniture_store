package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import lombok.Data;
import reactor.core.publisher.Mono;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.backend.Infraestructure.Adapters.Drivens.Entities.User;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings.ChangePasswordRequest;
import com.backend.Infraestructure.Adapters.Drivers.Security.user.UserService;

@Controller
@Data
public class UserController {

    private final UserService service;
    @MutationMapping(name = "changePassword")
    public Mono<String> changePassword(
            @Argument(name = "input") ChangePasswordRequest request) {
        return service.changePassword(request, request.username());
    }

    @QueryMapping(name = "getInfoUser")
    public Mono<User> user(@Argument(name = "username") String username) {
        return service.findByUsername(username);
}
}
