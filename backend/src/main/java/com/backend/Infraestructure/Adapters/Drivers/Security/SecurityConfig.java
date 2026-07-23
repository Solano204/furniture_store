package com.backend.Infraestructure.Adapters.Drivers.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

import com.backend.Infraestructure.Adapters.Drivens.Repositories.UserRepository;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Autowired
    private UserRepository repository;

    @Bean
    SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            // GraphQL is the entire API surface (no REST controllers exist in this
            // codebase) - the endpoint itself is public, GraphQlSecurityInterceptor
            // enforces per-operation auth inside the GraphQL execution pipeline
            // instead, since HTTP-layer path rules can't express "this query is
            // public, that mutation on the same endpoint isn't".
            .authorizeExchange(auth -> auth.pathMatchers("/graphql/**").permitAll()
                // Docker's healthcheck (and any orchestrator readiness probe) hits this
                // unauthenticated - without this it always gets 401, so the container
                // never reports healthy no matter how well the app is actually running.
                .pathMatchers("/actuator/health", "/actuator/health/**").permitAll()
                .anyExchange().authenticated());

        http.httpBasic(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Backs AuthenticationService's password verification during login/register.
    @Bean
    public ReactiveUserDetailsService userDetailsService() {
        return username -> repository.findByUsername(username)
            .map(user -> new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.isEnabled(),
                true, // account not expired
                true, // credentials not expired
                true, // account not locked
                user.getAuthorities()));
    }

    @Bean
    public ReactiveAuthenticationManager reactiveAuthenticationManager(ReactiveUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        return new UserDetailsRepositoryReactiveAuthenticationManager(userDetailsService) {
            {
                setPasswordEncoder(passwordEncoder);
            }
        };
    }

}
