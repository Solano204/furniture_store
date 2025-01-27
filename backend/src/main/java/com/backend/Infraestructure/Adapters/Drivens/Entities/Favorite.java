package com.backend.Infraestructure.Adapters.Drivens.Entities;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.query.Criteria;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "Favorite")
@Data
public class Favorite {

    @Id
    private String id;
    private String clerkId;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private String productId; // Reference to the Product
    @DBRef
    private Product product; // This will be populated after lookup
}
