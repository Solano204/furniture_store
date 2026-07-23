package com.backend.Infraestructure.Adapters.Drivens.Entities;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

import java.time.LocalDate;

// productId_clerkId backs findFirstByProductIdAndClerkId (FavoriteRepository).
@CompoundIndexes({
        @CompoundIndex(name = "productId_clerkId", def = "{'productId': 1, 'clerkId': 1}")
})
@Document(collection = "Favorite")
@Data
public class Favorite {

    @Id
    private String id;
    @Indexed
    private String clerkId;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private String productId; // Reference to the Product
    @Transient
    private Product product; // Populated manually by FavoriteService, not stored on the document
}
