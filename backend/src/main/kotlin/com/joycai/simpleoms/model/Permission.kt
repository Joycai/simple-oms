package com.joycai.simpleoms.model

import jakarta.persistence.*

@Entity
@Table(name = "permissions")
class Permission(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, unique = true, length = 100)
    var code: String,

    @Column(nullable = false, length = 50)
    var module: String,

    @Column(nullable = false, length = 50)
    var name: String,
)
