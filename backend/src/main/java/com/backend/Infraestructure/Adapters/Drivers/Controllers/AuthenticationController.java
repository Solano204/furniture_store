// FOLDER TO IMPLEMENT ALL MY SECURITY 


package com.backend.Infraestructure.Adapters.Drivers.Controllers;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;

import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings.AuthenticationResponse;
import com.backend.Infraestructure.Adapters.Drivers.Security.Services.AuthenticationService;

import java.io.IOException;
@Controller
@Data
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
    public Mono<Boolean> refreshToken(@Argument(name = "refreshToken") ServerRequest request) {
        // Assuming refreshToken uses this method to handle the logic   
        return service.refreshToken(request)
                .map(response -> true); // Return true if successful
    }

    @MutationMapping(name = "logout")
    public Mono<String> logout() {
        return Mono.just("Logout successful"); // Return true if successful
    }   
}
