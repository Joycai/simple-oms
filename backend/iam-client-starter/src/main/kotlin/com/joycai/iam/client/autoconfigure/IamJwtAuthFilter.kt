package com.joycai.iam.client.autoconfigure

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter
import java.security.PublicKey

class IamJwtAuthFilter(
    private val keyResolver: () -> List<PublicKey>,
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        chain: FilterChain,
    ) {
        val header = request.getHeader("Authorization")
        if (header != null && header.startsWith("Bearer ")) {
            val token = header.substring(7)
            try {
                val claims = parseClaims(token)
                val username = claims.subject
                val roles = extractList(claims, "roles")
                val permissions = extractList(claims, "permissions")

                val authorities = mutableSetOf<SimpleGrantedAuthority>()
                roles.forEach { authorities.add(SimpleGrantedAuthority("ROLE_$it")) }
                permissions.forEach { authorities.add(SimpleGrantedAuthority(it)) }

                SecurityContextHolder.getContext().authentication =
                    UsernamePasswordAuthenticationToken(username, null, authorities)
            } catch (_: Exception) {
                // Token invalid — leave context empty
            }
        }
        chain.doFilter(request, response)
    }

    private fun parseClaims(token: String): Claims {
        val keys = keyResolver()
        for (key in keys) {
            try {
                return Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token).payload
            } catch (_: Exception) { continue }
        }
        throw IllegalStateException("No key can verify this token")
    }

    @Suppress("UNCHECKED_CAST")
    private fun extractList(claims: Claims, key: String): List<String> =
        (claims.get(key, List::class.java) as? List<String>) ?: emptyList()
}
