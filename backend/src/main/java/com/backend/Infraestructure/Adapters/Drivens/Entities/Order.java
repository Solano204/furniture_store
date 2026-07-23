package com.backend.Infraestructure.Adapters.Drivens.Entities;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// Field order matches the Equality-Sort-Range pattern for
// findAllByClerkIdAndIsPaidTrueOrderByCreatedAtDesc (OrderRepository):
// equality fields (clerkId, isPaid) first, then the sort field (createdAt).
@CompoundIndex(name = "clerkId_isPaid_createdAt", def = "{'clerkId': 1, 'isPaid': 1, 'createdAt': -1}")
@Document(collection = "Orders")
@Data
public class Order {
    @Id
    private String id;
    private String clerkId;
    private Integer products;
    private BigDecimal orderTotal = BigDecimal.ZERO;

    private BigDecimal tax = BigDecimal.ZERO;

    private BigDecimal shipping = BigDecimal.ZERO;

    private String username;

    private Boolean isPaid = Boolean.TRUE; // Default value set to true.

    @CreatedDate
    private LocalDate createdAt;

    @LastModifiedDate
    private LocalDate updatedAt;
}
