package com.joycai.simpleoms.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthFilter(
    private val jwtUtil: JwtUtil,
    private val rolePermissionCache: RolePermissionCache,
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val authHeader = request.getHeader("Authorization")
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            val token = authHeader.substring(7)
            if (jwtUtil.isTokenValid(token)) {
                val username = jwtUtil.extractUsername(token)
                val roles = jwtUtil.extractRoles(token)

                val authorities = mutableSetOf<SimpleGrantedAuthority>()
                roles.forEach { role ->
                    authorities.add(SimpleGrantedAuthority("ROLE_$role"))
                    val permissions = rolePermissionCache.getPermissionsForRole(role)
                    permissions.forEach { perm ->
                        authorities.add(SimpleGrantedAuthority(perm))
                    }
                }

                val auth = UsernamePasswordAuthenticationToken(
                    username, null, authorities
                ).also {
                    it.details = WebAuthenticationDetailsSource().buildDetails(request)
                }
                SecurityContextHolder.getContext().authentication = auth
            }
        }
        filterChain.doFilter(request, response)
    }
}
