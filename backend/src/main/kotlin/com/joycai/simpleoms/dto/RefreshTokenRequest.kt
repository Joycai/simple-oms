package com.joycai.simpleoms.dto

import jakarta.validation.constraints.NotBlank

data class RefreshTokenRequest(
    @field:NotBlank(message = "refreshToken 不能为空")
    val refreshToken: String,
)
