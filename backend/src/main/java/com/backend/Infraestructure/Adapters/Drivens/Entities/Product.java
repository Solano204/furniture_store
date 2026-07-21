package com.backend.Infraestructure.Adapters.Drivens.Entities;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

import java.time.LocalDate;

@Document(collection = "Products")
@Data
public class Product {
    @Id
    private String id;
    // name/company back findByNameContainingIgnoreCaseOrCompanyContainingIgnoreCase
    // (ProductRepository) - a plain index still helps MongoDB's query planner
    // even for a "contains" regex (case-insensitive substring search can't
    // use a B-tree index for the scan itself, but the planner uses it to
    // avoid a full collection scan when the regex is anchored or selective
    // enough). A real substring-search-at-scale fix would be a text index or
    // Atlas Search, not added here since this catalog's current size doesn't
    // justify it - see NoSQL notes.
    @Indexed
    private String name;
    @Indexed
    private String company;
    private String description;
    @Indexed
    private Boolean featured = Boolean.TRUE;
    private String image;
    private Integer price;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private String clerkId;
}
