package com.backend.Infraestructure.Adapters.Drivers.Security;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;

import java.util.Map;

import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Slf4j
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

        // Was including ex.getMessage() straight in the client-facing error -
        // for an unclassified exception that's a Mongo driver error, a NPE
        // message with an internal field name, etc, handed to whoever sent
        // the request. Full exception logged server-side where it's useful;
        // client gets a generic message and an errorCode to act on
        // programmatically, same shape as the GraphQLCustomException branch
        // above instead of a differently-shaped ad hoc fallback.
        log.error("Unhandled exception in GraphQL data fetcher", ex);
        return GraphqlErrorBuilder.newError(env)
            .message("An unexpected error occurred. Please try again.")
            .errorType(graphql.ErrorType.DataFetchingException)
            .extensions(Map.of("errorCode", "INTERNAL_ERROR"))
            .build();
    }
}
