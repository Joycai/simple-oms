package com.joycai.simpleoms.dto

data class UpdateProfileRequest(
    val nickname: String? = null,
    val phone: String? = null,
    val email: String? = null,
)
