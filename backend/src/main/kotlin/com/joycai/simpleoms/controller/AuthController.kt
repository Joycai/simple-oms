package com.joycai.simpleoms.controller

import com.joycai.simpleoms.dto.*
import com.joycai.simpleoms.model.User
import com.joycai.simpleoms.repository.UserRepository
import com.joycai.simpleoms.security.JwtUtil
import com.joycai.simpleoms.security.RefreshTokenService
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
    private val userRepository: UserRepository,
    private val refreshTokenService: RefreshTokenService,
) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<Map<String, Any>> {
        if (userRepository.existsByUsername(request.username)) {
            return ResponseEntity.badRequest().body(mapOf("message" to "用户名已存在"))
        }
        if (request.email != null && userRepository.existsByEmail(request.email)) {
            return ResponseEntity.badRequest().body(mapOf("message" to "邮箱已被注册"))
        }

        val user = userRepository.save(
            User(
                username = request.username,
                password = passwordEncoder.encode(request.password)!!,
                email = request.email,
            )
        )

        return ResponseEntity.ok(
            mapOf(
                "id" to user.id,
                "username" to user.username,
                "email" to (user.email ?: ""),
            )
        )
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {
        val user = userDetailsService.loadUserByUsername(request.username)
            ?: throw BadCredentialsException("用户名或密码错误")

        if (!passwordEncoder.matches(request.password, user.password)) {
            throw BadCredentialsException("用户名或密码错误")
        }

        val accessToken = jwtUtil.generateAccessToken(user.username)
        val (tokenId, refreshToken) = jwtUtil.generateRefreshToken(user.username)
        refreshTokenService.store(tokenId, user.username)

        return ResponseEntity.ok(
            LoginResponse(
                accessToken = accessToken,
                refreshToken = refreshToken,
                username = user.username,
            )
        )
    }

    @PostMapping("/refresh")
    fun refresh(@Valid @RequestBody request: RefreshTokenRequest): ResponseEntity<LoginResponse> {
        if (!jwtUtil.isTokenValid(request.refreshToken)) {
            throw BadCredentialsException("refreshToken 无效或已过期")
        }

        val username = jwtUtil.extractUsername(request.refreshToken)
        val tokenId = jwtUtil.extractTokenId(request.refreshToken)
            ?: throw BadCredentialsException("refreshToken 格式无效")

        if (!refreshTokenService.isValid(tokenId)) {
            throw BadCredentialsException("refreshToken 已被撤销")
        }

        // Rotate: revoke old, issue new
        refreshTokenService.revoke(tokenId)
        val newAccessToken = jwtUtil.generateAccessToken(username)
        val (newTokenId, newRefreshToken) = jwtUtil.generateRefreshToken(username)
        refreshTokenService.store(newTokenId, username)

        return ResponseEntity.ok(
            LoginResponse(
                accessToken = newAccessToken,
                refreshToken = newRefreshToken,
                username = username,
            )
        )
    }

    @PostMapping("/logout")
    fun logout(@Valid @RequestBody request: RefreshTokenRequest): ResponseEntity<Map<String, String>> {
        try {
            val tokenId = jwtUtil.extractTokenId(request.refreshToken)
            if (tokenId != null) {
                refreshTokenService.revoke(tokenId)
            }
        } catch (_: Exception) {
            // Token already invalid, no-op
        }
        return ResponseEntity.ok(mapOf("message" to "已退出登录"))
    }
}
