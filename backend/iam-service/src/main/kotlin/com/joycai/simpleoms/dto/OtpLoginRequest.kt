package com.joycai.simpleoms.dto

import jakarta.validation.constraints.NotBlank

data class OtpLoginRequest(
    @field:NotBlank val username: String,
    @field:NotBlank val password: String,
    val otpCode: String? = null,
)
