package com.joycai.simpleoms.model

import jakarta.persistence.*

@Entity
@Table(name = "roles")
class Role(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 50)
    val name: String,

    @Column(length = 200)
    val description: String? = null,

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = [JoinColumn(name = "role_id")],
        inverseJoinColumns = [JoinColumn(name = "permission_id")],
    )
    val permissions: MutableList<Permission> = mutableListOf(),

    @ManyToMany(mappedBy = "roles")
    val users: MutableList<User> = mutableListOf(),
) {
    override fun equals(other: Any?): Boolean = other is Role && other.id == id
    override fun hashCode(): Int = id.hashCode()
}
