package com.backend.Infraestructure.Adapters.Drivens.Entities;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.backend.Infraestructure.Adapters.Drivers.Security.token.TokenType;

import lombok.Builder;
import lombok.Data;


// This is the entity token
@Data
@Builder
@Document(collection = "Token")
public class Token {

  @Id
  public String id;
  public String token;
  public TokenType tokenType = TokenType.BEARER;
  public String user;
}
