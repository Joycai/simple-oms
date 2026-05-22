package com.joycai.simpleoms.dto

data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val username: String,
)
