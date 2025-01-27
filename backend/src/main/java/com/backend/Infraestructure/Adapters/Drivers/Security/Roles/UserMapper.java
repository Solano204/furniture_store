package com.backend.Infraestructure.Adapters.Drivers.Security.Roles;

import java.util.Set;
 import com.backend.Infraestructure.Adapters.Drivens.Entities.User;
 import com.backend.Infraestructure.Adapters.Drivens.Graphql.DocumentMappings.RegisterRequests;

 public class UserMapper {
    public static User fromRegisterRequest(RegisterRequests request) {
        // Convert the role string to UserRole, default to USER if invalid
        UserRole userRole;
        try {
            userRole = UserRole.valueOf(request.role().toUpperCase()); // Convert to uppercase to match enum names
        } catch (IllegalArgumentException | NullPointerException e) {
            userRole = UserRole.USER; // Default role
        }
        return User.builder()
        .username(request.username())
        .password(request.password())
                .permissions(Set.of(new Role(userRole))) // Assign role
                .build();
    }
}
