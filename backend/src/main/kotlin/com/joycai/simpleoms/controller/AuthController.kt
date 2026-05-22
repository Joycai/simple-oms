package com.joycai.simpleoms.controller

import com.joycai.simpleoms.dto.*
import com.joycai.simpleoms.model.User
import com.joycai.simpleoms.repository.UserRepository
import com.joycai.simpleoms.security.JwtUtil
import com.joycai.simpleoms.security.RefreshTokenService
import com.joycai.simpleoms.security.TotpUtil
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*
import java.security.SecureRandom
import java.util.Base64

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val jwtUtil: JwtUtil,
    private val userDetailsService: UserDetailsService,
    private val passwordEncoder: PasswordEncoder,
    private val userRepository: UserRepository,
    private val refreshTokenService: RefreshTokenService,
    private val totpUtil: TotpUtil,
) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<Map<String, Any>> {
        if (userRepository.existsByUsername(request.username))
            return ResponseEntity.badRequest().body(mapOf("message" to "用户名已存在"))
        if (request.email != null && userRepository.existsByEmail(request.email))
            return ResponseEntity.badRequest().body(mapOf("message" to "邮箱已被注册"))
        val user = userRepository.save(User(username = request.username, password = passwordEncoder.encode(request.password)!!, email = request.email))
        return ResponseEntity.ok(mapOf("id" to user.id, "username" to user.username, "email" to (user.email ?: "")))
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<*> {
        val user = userRepository.findByUsername(request.username) ?: throw authError()
        if (!passwordEncoder.matches(request.password, user.password)) throw authError()
        if (user.totpEnabled) return ResponseEntity.ok(mapOf("requiresOtp" to true, "username" to user.username))
        return issueTokens(user)
    }

    @PostMapping("/login/otp")
    fun loginWithOtp(@Valid @RequestBody request: OtpLoginRequest): ResponseEntity<LoginResponse> {
        val user = userRepository.findByUsername(request.username) ?: throw authError()
        if (!passwordEncoder.matches(request.password, user.password)) throw authError()
        if (!user.totpEnabled || user.totpSecret == null) throw BadCredentialsException("2FA 未启用")
        val code = request.otpCode ?: throw BadCredentialsException("请输入验证码")
        if (!otpVerify(user, code)) throw BadCredentialsException("验证码无效")
        return issueTokens(user)
    }

    @PutMapping("/change-password")
    fun changePassword(@Valid @RequestBody request: ChangePasswordRequest, @AuthenticationPrincipal username: String): ResponseEntity<Map<String, String>> {
        val user = userRepository.findByUsername(username) ?: throw authError()
        if (!passwordEncoder.matches(request.oldPassword, user.password)) throw BadCredentialsException("旧密码错误")
        user.password = passwordEncoder.encode(request.newPassword)!!
        userRepository.save(user)
        refreshTokenService.revokeAllForUser(username)
        return ResponseEntity.ok(mapOf("message" to "密码已修改，请重新登录"))
    }

    @GetMapping("/otp/setup")
    fun getOtpSetup(@AuthenticationPrincipal username: String): ResponseEntity<Map<String, Any>> {
        val secret = totpUtil.generateSecret()
        val qrUrl = totpUtil.generateQrUrl(secret, username)
        return ResponseEntity.ok(mapOf("secret" to secret, "qrUrl" to qrUrl))
    }

    @PostMapping("/otp/verify")
    fun verifyAndEnableOtp(@Valid @RequestBody request: TotpVerifyRequest, @AuthenticationPrincipal username: String): ResponseEntity<Map<String, Any>> {
        val user = userRepository.findByUsername(username)!!
        val secret = request.secret ?: return ResponseEntity.badRequest().body(mapOf("message" to "请先调用 GET /otp/setup"))
        if (!totpUtil.verifyCode(secret, request.code)) return ResponseEntity.badRequest().body(mapOf("message" to "验证码无效"))
        user.totpSecret = secret
        user.totpEnabled = true
        val codes = generateRecoveryCodes()
        user.recoveryCodes = codes.joinToString(",")
        userRepository.save(user)
        return ResponseEntity.ok(mapOf("enabled" to true, "recoveryCodes" to codes))
    }

    @GetMapping("/otp/recovery-codes")
    fun getRecoveryCodes(@AuthenticationPrincipal username: String): ResponseEntity<Map<String, Any>> {
        val codes = userRepository.findByUsername(username)!!.recoveryCodes?.split(",") ?: emptyList()
        return ResponseEntity.ok(mapOf("codes" to codes))
    }

    @PostMapping("/otp/regenerate-codes")
    fun regenerateRecoveryCodes(@AuthenticationPrincipal username: String): ResponseEntity<Map<String, Any>> {
        val user = userRepository.findByUsername(username)!!
        val codes = generateRecoveryCodes()
        user.recoveryCodes = codes.joinToString(",")
        userRepository.save(user)
        return ResponseEntity.ok(mapOf("codes" to codes))
    }

    @GetMapping("/user/me")
    fun getCurrentUser(@AuthenticationPrincipal username: String): ResponseEntity<Map<String, Any>> {
        val user = userRepository.findByUsername(username)!!
        return ResponseEntity.ok(mapOf("username" to user.username, "email" to (user.email ?: ""), "totpEnabled" to user.totpEnabled))
    }

    // token helpers
    private fun issueTokens(user: User): ResponseEntity<LoginResponse> {
        val userDetails = userDetailsService.loadUserByUsername(user.username)
        val roles = userDetails.authorities.mapNotNull { it.authority?.removePrefix("ROLE_") }
        val accessToken = jwtUtil.generateAccessToken(user.username, roles)
        val (tokenId, refreshToken) = jwtUtil.generateRefreshToken(user.username, roles)
        refreshTokenService.store(tokenId, user.username)
        return ResponseEntity.ok(LoginResponse(accessToken = accessToken, refreshToken = refreshToken, username = user.username))
    }

    private fun otpVerify(user: User, code: String): Boolean {
        if (totpUtil.verifyCode(user.totpSecret!!, code)) return true
        // Try recovery codes
        val codes = user.recoveryCodes?.split(",")?.toMutableList() ?: return false
        val match = codes.find { it.trim() == code.trim() } ?: return false
        codes.remove(match)
        user.recoveryCodes = codes.joinToString(",")
        userRepository.save(user)
        return true
    }

    private fun generateRecoveryCodes(): List<String> = (1..10).map {
        val bytes = ByteArray(8); SecureRandom().nextBytes(bytes)
        Base64.getUrlEncoder().withoutPadding().encodeToString(bytes).take(8).uppercase()
    }

    private fun authError() = BadCredentialsException("用户名或密码错误")
}
