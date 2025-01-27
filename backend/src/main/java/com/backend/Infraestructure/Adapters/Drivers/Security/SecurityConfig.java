package com.backend.Infraestructure.Adapters.Drivers.Security;
 import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
 import org.springframework.context.annotation.Configuration;
 import org.springframework.core.convert.converter.Converter;
 import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
 import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.server.SecurityWebFilterChain;

import com.backend.Infraestructure.Adapters.Drivens.Entities.User;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.UserRepository;

import lombok.Data;
import reactor.core.publisher.Mono;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.authorization.method.PrePostTemplateDefaults;
import org.springframework.security.config.Customizer;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

@Autowired
private UserRepository repository;

@Bean
  SecurityWebFilterChain SecurityFilterChain(ServerHttpSecurity http) throws Exception {
    http
    .csrf(crs -> crs.disable())
    .authorizeExchange(auth -> auth.pathMatchers("/**,/graphql","/graphql/**").permitAll()
    .anyExchange().authenticated());

    http.httpBasic(Customizer.withDefaults());
    return http.build();
}

// This bean will active the using of own annotation to level in security


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
}
// Here I create my own serviceUserDetail extract the userName(if exits a class
    // or interface defined by java, I can create my own class with a Bean)
    @Bean
    public ReactiveUserDetailsService userDetailsService() {
        return username -> repository.findByUsername(username)
        .map(user -> new org.springframework.security.core.userdetails.User(
            user.getUsername(), // Username (Username in this case)
            user.getPassword(), // Encoded password
                        user.isEnabled(), // Whether the user is enabled
                        true, // Account is not expired
                        true, // Credentials are not expired
                        true, // Account is not locked
                        user.getAuthorities() // Granted authorities (roles)
                        ));
    }
    
    @Bean
    public ReactiveAuthenticationManager reactiveAuthenticationManager(ReactiveUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        return new UserDetailsRepositoryReactiveAuthenticationManager(userDetailsService) {
            {
                setPasswordEncoder(passwordEncoder); // Set the PasswordEncoder
            }
        };
    }
    
}