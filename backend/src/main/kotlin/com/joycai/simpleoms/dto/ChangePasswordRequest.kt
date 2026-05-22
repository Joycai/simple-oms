package com.joycai.simpleoms.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class ChangePasswordRequest(
    @field:NotBlank val oldPassword: String,
    @field:NotBlank @field:Size(min = 6, max = 100) val newPassword: String,
)
