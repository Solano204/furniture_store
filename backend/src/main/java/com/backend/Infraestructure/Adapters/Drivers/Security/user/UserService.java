package com.backend.Infraestructure.Adapters.Drivers.Security.user;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.Infraestructure.Adapters.Drivens.Entities.User;
import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings.ChangePasswordRequest;
import com.backend.Infraestructure.Adapters.Drivens.Repositories.UserRepository;
import com.backend.Infraestructure.Adapters.Drivers.Security.GraphQLCustomException;

@Service
@Data
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository repository;

    public Mono<String> changePassword(ChangePasswordRequest request, String connectedUser) {
        return repository.findByUsername(connectedUser) // Find the user by username
                .switchIfEmpty(Mono.error(new GraphQLCustomException(
                        "User not found",
                        "USER_NOT_FOUND",
                        "The connected user does not exist.")))
                .flatMap(user -> {
                    // Check if the current password is correct
                    if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
                        return Mono.error(new GraphQLCustomException(
                                "Current password is incorrect",
                                "CURRENT_PASSWORD_INCORRECT",
                                "The current password is incorrect, please try again."));
                    }

                    // Check if the two new passwords match
                    if (!request.newPassword().equals(request.confirmationPassword())) {
                        return Mono.error(new GraphQLCustomException(
                                "New passwords do not match",
                                "NEW_PASSWORDS_DO_NOT_MATCH",
                                "The new passwords do not match, please try again."));
                    }

                    // Update the password
                    user.setPassword(passwordEncoder.encode(request.newPassword()));

                    // Save the new password and return a success message
                    return repository.save(user)
                            .thenReturn("Password changed successfully");
                });
    }


    public Mono<User> findByUsername(String username) {
        return repository.findByUsername(username);
    }

}