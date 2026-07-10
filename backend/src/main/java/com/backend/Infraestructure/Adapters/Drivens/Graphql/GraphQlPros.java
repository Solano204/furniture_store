package com.backend.Infraestructure.Adapters.Drivens.Graphql;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "graphql")
public class GraphQlPros{

    private List<String> queriesToCheck;
    private List<String> mutationsToCheck;
    // Query/mutation field names that require ROLE_ADMIN even though they're
    // already behind the general authenticated check (e.g. catalog management,
    // the all-users order list) - see GraphQlSecurityInterceptor.
    private List<String> adminOperations;

    // Getters and Setters
    public List<String> getQueriesToCheck() {
        return queriesToCheck;
    }

    public void setQueriesToCheck(List<String> queriesToCheck) {
        this.queriesToCheck = queriesToCheck;
    }

    public List<String> getMutationsToCheck() {
        return mutationsToCheck;
    }

    public void setMutationsToCheck(List<String> mutationsToCheck) {
        this.mutationsToCheck = mutationsToCheck;
    }

    public List<String> getAdminOperations() {
        return adminOperations;
    }

    public void setAdminOperations(List<String> adminOperations) {
        this.adminOperations = adminOperations;
    }
}
