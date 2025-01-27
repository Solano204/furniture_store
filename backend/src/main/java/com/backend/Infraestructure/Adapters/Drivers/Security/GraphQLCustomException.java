package com.backend.Infraestructure.Adapters.Drivers.Security;

public class GraphQLCustomException extends RuntimeException {
    private final String errorCode;
    private final String details;

    public GraphQLCustomException(String message, String errorCode, String details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getDetails() {
        return details;
    }
}
