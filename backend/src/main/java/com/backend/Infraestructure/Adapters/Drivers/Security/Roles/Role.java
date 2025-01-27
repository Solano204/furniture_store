package com.backend.Infraestructure.Adapters.Drivers.Security.Roles;
import java.util.Objects;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import lombok.AllArgsConstructor;
import lombok.Data;

import org.springframework.security.core.GrantedAuthority;


@Data
public class Role {

    private UserRole name;

    public Role() {
    }

    public Role(UserRole name) {
        this.name = name;
    }



    public UserRole getName() {
        return name;
    }

    public void setName(UserRole name) {
        this.name = name;
    }

    public GrantedAuthority toGrantedAuthority() {
        return new SimpleGrantedAuthority("ROLE_" + name.name());
    }
}
