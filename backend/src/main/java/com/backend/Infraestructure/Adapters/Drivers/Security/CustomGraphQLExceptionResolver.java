package com.backend.Infraestructure.Adapters.Drivers.Security;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;

import java.util.Map;

import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.stereotype.Component;

@Component
public class CustomGraphQLExceptionResolver extends DataFetcherExceptionResolverAdapter {

    @Override
    protected GraphQLError resolveToSingleError(Throwable ex, DataFetchingEnvironment env) {
        if (ex instanceof GraphQLCustomException customException) {
            return GraphqlErrorBuilder.newError(env)
                .message(customException.getMessage())
                .errorType(graphql.ErrorType.ValidationError)
                .extensions(Map.of(
                    "errorCode", customException.getErrorCode(),
                    "details", customException.getDetails()
                ))
                .build();
        }

        // Default fallback for other exceptions
        return GraphqlErrorBuilder.newError(env)
            .message("An unexpected error occurred: " + ex.getMessage())
            .errorType(graphql.ErrorType.DataFetchingException)
            .build();
    }
}
