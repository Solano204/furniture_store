package com.backend.Infraestructure.Adapters.Drivens.Entities;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Document(collection = "Reviews")
@Data
public class Review {
    @Id
    private String id;
    private String clerkId;
    private Integer rating;
    private String comment;
    private String authorName;
    private String authorImageUrl;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private String productId; // Reference to the Product
    @Transient
    private Product product;
}
