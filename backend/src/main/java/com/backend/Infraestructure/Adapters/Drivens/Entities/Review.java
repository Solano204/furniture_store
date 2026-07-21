package com.backend.Infraestructure.Adapters.Drivens.Entities;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

import java.time.LocalDate;

// productId_clerkId backs existsByProductIdAndClerkId (ReviewRepository) -
// productId alone (its prefix) also serves findAllByProductId/
// findAllByProductIdOrderByCreatedAtDesc, so a separate single-field index on
// productId would be redundant.
@CompoundIndexes({
        @CompoundIndex(name = "productId_clerkId", def = "{'productId': 1, 'clerkId': 1}")
})
@Document(collection = "Reviews")
@Data
public class Review {
    @Id
    private String id;
    @Indexed
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
