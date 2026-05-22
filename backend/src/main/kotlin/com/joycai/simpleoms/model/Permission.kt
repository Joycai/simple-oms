package com.joycai.simpleoms.model

import jakarta.persistence.*

@Entity
@Table(name = "permissions")
data class Permission(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 100)
    val code: String,

    @Column(nullable = false, length = 50)
    val module: String,

    @Column(nullable = false, length = 50)
    val name: String,
)
