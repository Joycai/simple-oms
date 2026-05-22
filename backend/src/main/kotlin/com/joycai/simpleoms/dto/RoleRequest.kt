package com.joycai.simpleoms.dto

import jakarta.validation.constraints.NotBlank

data class RoleRequest(
    @field:NotBlank(message = "角色名不能为空")
    val name: String,

    val description: String? = null,
)
