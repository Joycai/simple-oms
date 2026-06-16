package com.joycai.simpleoms.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RegisterRequest(
    @field:NotBlank(message = "用户名不能为空")
    @field:Size(min = 3, max = 50, message = "用户名长度 3-50")
    val username: String,

    @field:NotBlank(message = "密码不能为空")
    @field:Size(min = 6, max = 100, message = "密码长度 6-100")
    val password: String,

    @field:Email(message = "邮箱格式不正确")
    val email: String? = null,
)
