package com.joycai.simpleoms.config

import com.joycai.simpleoms.model.Permission
import com.joycai.simpleoms.model.Role
import com.joycai.simpleoms.model.User
import com.joycai.simpleoms.repository.PermissionRepository
import com.joycai.simpleoms.repository.RoleRepository
import com.joycai.simpleoms.repository.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.security.crypto.password.PasswordEncoder

@Configuration
class DataInitializer {

    @Bean
    @Order(1)
    fun seedPermissions(permissionRepository: PermissionRepository) = CommandLineRunner {
        val permissions = listOf(
            "user:read" to ("用户管理" to "查看用户"),
            "user:write" to ("用户管理" to "创建/编辑用户"),
            "user:delete" to ("用户管理" to "删除用户"),
            "role:read" to ("角色管理" to "查看角色"),
            "role:write" to ("角色管理" to "创建/编辑角色"),
            "role:delete" to ("角色管理" to "删除角色"),
            "order:read" to ("订单管理" to "查看订单"),
            "order:write" to ("订单管理" to "创建/编辑订单"),
            "order:delete" to ("订单管理" to "删除订单"),
            "inventory:read" to ("库存管理" to "查看库存"),
            "inventory:write" to ("库存管理" to "管理库存"),
            "report:read" to ("数据报表" to "查看报表"),
        )
        permissions.forEach { (code, groupName) ->
            if (permissionRepository.findByCode(code) == null) {
                permissionRepository.save(
                    Permission(code = code, group = groupName.first, name = groupName.second)
                )
            }
        }
    }

    @Bean
    @Order(2)
    fun seedRoles(roleRepository: RoleRepository, permissionRepository: PermissionRepository) = CommandLineRunner {
        if (!roleRepository.existsByName("admin")) {
            val adminRole = roleRepository.save(Role(name = "admin", description = "系统管理员"))
            adminRole.permissions.addAll(permissionRepository.findAll())
            roleRepository.save(adminRole)
        }
        if (!roleRepository.existsByName("user")) {
            roleRepository.save(Role(name = "user", description = "普通用户"))
        }
    }

    @Bean
    @Order(3)
    fun seedAdminUser(
        userRepository: UserRepository,
        roleRepository: RoleRepository,
        passwordEncoder: PasswordEncoder,
    ) = CommandLineRunner {
        if (!userRepository.existsByUsername("admin")) {
            val adminRole = roleRepository.findByName("admin")
            val admin = User(
                username = "admin",
                password = passwordEncoder.encode("admin123")!!,
                email = "admin@simple-oms.local",
            )
            if (adminRole != null) admin.roles.add(adminRole)
            userRepository.save(admin)
        }
    }
}
