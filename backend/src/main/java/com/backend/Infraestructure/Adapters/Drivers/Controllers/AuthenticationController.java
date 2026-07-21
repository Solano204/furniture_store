package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivers.Security.Services.AuthenticationService;

@Controller
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @MutationMapping(name = "register")
    public Mono<DocumentMappings.AuthenticationResponse> register(
            @Argument(name = "input") DocumentMappings.RegisterRequests request) {
        return service.register(request);
    }

    @MutationMapping(name = "authenticate")
    public Mono<DocumentMappings.AuthenticationResponse> authenticate(
            @Argument(name = "input") DocumentMappings.AuthenticationRequest request) {
        return service.authenticate(request);
    }

    @MutationMapping(name = "refreshToken")
    public Mono<String> refreshToken(@Argument(name = "refreshToken") String refreshToken) {
        return service.refreshToken(refreshToken);
    }

    @MutationMapping(name = "logout")
    public Mono<String> logout() {
        return Mono.just("Logout successful"); // Return true if successful
    }   
}
