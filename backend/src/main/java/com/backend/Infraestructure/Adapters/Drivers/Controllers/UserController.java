package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import org.springframework.data.mongodb.repository.Query;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.Infraestructure.Adapters.Drivens.Entities.User;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings.ChangePasswordRequest;
 import com.backend.Infraestructure.Adapters.Drivers.Security.user.UserService;
 
 import java.security.Principal;

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
