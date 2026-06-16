package com.joycai.orderservice.model

import jakarta.persistence.*

@Entity
@Table(name = "item_images", uniqueConstraints = [UniqueConstraint(columnNames = ["item_id", "content_hash"])])
class ItemImage(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "item_id", nullable = false)
    var itemId: Long,

    /** Relative filesystem path under the upload directory, e.g. "items/42/abc123.jpg" */
    @Column(nullable = false, length = 512)
    var path: String,

    @Column(name = "content_hash", nullable = false, length = 64)
    var contentHash: String = "",

    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int = 0,
)
