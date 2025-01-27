package com.backend.Infraestructure.Adapters.Drivens.Entities;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "Products")
@Data
public class Product {
    @Id
    private String id;
    private String name;
    private String company;
    private String description;
    private Boolean featured = Boolean.TRUE;
    private String image;
    private Integer price;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private String clerkId;
}
