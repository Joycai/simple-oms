package com.joycai.simpleoms.config

import com.joycai.simpleoms.model.User
import com.joycai.simpleoms.repository.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.core.annotation.Order

@Configuration
class DataInitializer {

    @Bean
    @Order(1)
    fun seedAdminUser(userRepository: UserRepository, passwordEncoder: PasswordEncoder) = CommandLineRunner {
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(
                User(
                    username = "admin",
                    password = passwordEncoder.encode("admin123")!!,
                    email = "admin@simple-oms.local",
                )
            )
        }
    }
}
