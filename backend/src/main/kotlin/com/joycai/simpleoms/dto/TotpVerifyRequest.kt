package com.joycai.simpleoms.dto

import jakarta.validation.constraints.NotBlank

data class TotpVerifyRequest(
    @field:NotBlank val code: String,
    val secret: String? = null,
)
