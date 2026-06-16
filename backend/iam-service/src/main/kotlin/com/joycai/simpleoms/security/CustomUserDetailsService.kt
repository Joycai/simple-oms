package com.joycai.simpleoms.security

import com.joycai.simpleoms.repository.UserRepository
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository,
) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val user = userRepository.findByUsername(username)
            ?: throw UsernameNotFoundException("用户不存在: $username")
        val roleNames = user.roles.map { it.name }.toTypedArray()
        return User.builder()
            .username(user.username)
            .password(user.password)
            .disabled(!user.enabled)
            .roles(*roleNames)
            .build()
    }
}
