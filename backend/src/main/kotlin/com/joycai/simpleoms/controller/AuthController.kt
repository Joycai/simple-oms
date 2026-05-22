package com.joycai.simpleoms.controller

import com.joycai.simpleoms.dto.LoginRequest
import com.joycai.simpleoms.dto.LoginResponse
import com.joycai.simpleoms.security.JwtUtil
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val jwtUtil: JwtUtil,
    private val userDetailsService: UserDetailsService,
    private val passwordEncoder: PasswordEncoder,
) {

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {
        val user = userDetailsService.loadUserByUsername(request.username)
            ?: throw BadCredentialsException("用户名或密码错误")

        if (!passwordEncoder.matches(request.password, user.password)) {
            throw BadCredentialsException("用户名或密码错误")
        }

        val token = jwtUtil.generateToken(user.username)
        return ResponseEntity.ok(LoginResponse(token = token, username = user.username))
    }
}
