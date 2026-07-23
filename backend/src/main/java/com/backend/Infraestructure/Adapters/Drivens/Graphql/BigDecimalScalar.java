package com.backend.Infraestructure.Adapters.Drivens.Graphql;

import graphql.language.FloatValue;
import graphql.language.IntValue;
import graphql.language.StringValue;
import graphql.language.Value;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;
import graphql.schema.GraphQLScalarType;

import java.math.BigDecimal;

public final class BigDecimalScalar {

    // Built on graphql-java's core Coercing API (already on the classpath via
    // spring-boot-starter-graphql) rather than the graphql-java-extended-scalars
    // library - that would be a new third-party dependency whose version
    // compatibility with this project's bundled graphql-java can't be
    // verified without network access in this pass. This does the same job
    // with what's already present, no version guess required.
    public static final GraphQLScalarType BIG_DECIMAL = GraphQLScalarType.newScalar()
            .name("BigDecimal")
            .description("Exact-precision decimal for money fields (orderTotal, tax, shipping). " +
                    "The schema previously used the built-in Float scalar for these, which round-trips " +
                    "through a binary double and can silently lose precision on money values.")
            .coercing(new Coercing<BigDecimal, BigDecimal>() {
                @Override
                public BigDecimal serialize(Object dataFetcherResult) {
                    if (dataFetcherResult instanceof BigDecimal bigDecimal) {
                        return bigDecimal;
                    }
                    if (dataFetcherResult instanceof Number number) {
                        return new BigDecimal(number.toString());
                    }
                    throw new CoercingSerializeException("Expected a BigDecimal or Number, got: " + dataFetcherResult);
                }

                @Override
                public BigDecimal parseValue(Object input) {
                    try {
                        if (input instanceof BigDecimal bigDecimal) {
                            return bigDecimal;
                        }
                        if (input instanceof Number number) {
                            return new BigDecimal(number.toString());
                        }
                        if (input instanceof String string) {
                            return new BigDecimal(string);
                        }
                    } catch (NumberFormatException e) {
                        throw new CoercingParseValueException("Not a valid BigDecimal: " + input, e);
                    }
                    throw new CoercingParseValueException("Expected a BigDecimal, Number, or String, got: " + input);
                }

                @Override
                public BigDecimal parseLiteral(Object input) {
                    if (!(input instanceof Value<?> value)) {
                        throw new CoercingParseLiteralException("Expected an AST Value, got: " + input);
                    }
                    if (value instanceof StringValue stringValue) {
                        try {
                            return new BigDecimal(stringValue.getValue());
                        } catch (NumberFormatException e) {
                            throw new CoercingParseLiteralException("Not a valid BigDecimal: " + stringValue.getValue(), e);
                        }
                    }
                    if (value instanceof IntValue intValue) {
                        return new BigDecimal(intValue.getValue());
                    }
                    if (value instanceof FloatValue floatValue) {
                        return floatValue.getValue();
                    }
                    throw new CoercingParseLiteralException("Expected a String, Int, or Float literal, got: " + input);
                }
            })
            .build();

    private BigDecimalScalar() {
    }
}
