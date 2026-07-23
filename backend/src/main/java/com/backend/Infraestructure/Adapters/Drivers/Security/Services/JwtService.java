package com.backend.Infraestructure.Adapters.Drivers.Security.Services;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import reactor.core.publisher.Mono;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;


// In this class I have the method with certain relation with the token

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    public Mono<String> extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> Mono<T> extractClaim(String token, Function<Claims, T> claimsResolver) {
        return extractAllClaims(token)
                .map(claimsResolver);
    }

    public Mono<String> generateToken(UserDetails userDetails) {
        return generateToken(Map.of(), userDetails);
    }

    public Mono<String> generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Mono.fromCallable(() -> buildToken(extraClaims, userDetails, jwtExpiration));
    }

    public Mono<String> generateRefreshToken(UserDetails userDetails) {
        return Mono.fromCallable(() -> buildToken(Map.of(), userDetails, refreshExpiration));
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Expired/malformed/tampered tokens make the underlying JJWT parser throw
    // (e.g. ExpiredJwtException) rather than just returning stale claims, so
    // without onErrorReturn this would surface as an unhandled parse error
    // instead of the plain "not valid" the caller is asking about.
    public Mono<Boolean> isTokenValid(String token, UserDetails userDetails) {
        return Mono.zip(extractUsername(token), extractExpiration(token))
                .map(claims -> claims.getT1().equals(userDetails.getUsername()) && claims.getT2().after(new Date()))
                .onErrorReturn(false);
    }

    private Mono<Date> extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Mono<Claims> extractAllClaims(String token) {
        return Mono.fromCallable(() -> Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody());
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

