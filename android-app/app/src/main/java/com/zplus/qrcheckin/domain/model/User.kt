package com.zplus.qrcheckin.domain.model

data class User(
    val id: String,
    val email: String,
    val username: String,
    val firstName: String,
    val lastName: String,
    val role: Role,
    val isActive: Boolean
)

enum class Role {
    ADMIN,
    STAFF,
    USER
}