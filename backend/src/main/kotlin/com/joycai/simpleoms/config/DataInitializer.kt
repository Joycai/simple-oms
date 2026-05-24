package com.joycai.simpleoms.config

import com.joycai.simpleoms.model.Permission
import com.joycai.simpleoms.model.Role
import com.joycai.simpleoms.model.SigningKey
import com.joycai.simpleoms.model.User
import com.joycai.simpleoms.repository.PermissionRepository
import com.joycai.simpleoms.repository.RoleRepository
import com.joycai.simpleoms.repository.SigningKeyRepository
import com.joycai.simpleoms.repository.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.security.crypto.password.PasswordEncoder
import java.security.KeyPairGenerator
import java.security.interfaces.ECPrivateKey
import java.security.interfaces.ECPublicKey
import java.util.Base64
import java.util.UUID

@Configuration
class DataInitializer {

    @Bean
    @Order(0)
    fun generateSigningKey(signingKeyRepository: SigningKeyRepository) = CommandLineRunner {
        if (signingKeyRepository.count() == 0L) {
            val gen = KeyPairGenerator.getInstance("EC")
            gen.initialize(256)
            val pair = gen.generateKeyPair()
            val priv = pair.private as ECPrivateKey
            val pub = pair.public as ECPublicKey
            val b64 = Base64.getEncoder()
            signingKeyRepository.save(
                SigningKey(
                    kid = UUID.randomUUID().toString().take(8),
                    keyType = "EC",
                    privateKeyPem = "-----BEGIN PRIVATE KEY-----\n" + b64.encodeToString(priv.encoded) + "\n-----END PRIVATE KEY-----",
                    publicKeyPem = "-----BEGIN PUBLIC KEY-----\n" + b64.encodeToString(pub.encoded) + "\n-----END PUBLIC KEY-----",
                    algorithm = "ES256",
                )
            )
        }
    }

    @Bean
    @Order(1)
    fun seedPermissions(permissionRepository: PermissionRepository) = CommandLineRunner {
        // Clean up old-format permissions (two-segment codes from before IAM refactoring)
        val oldCodes = listOf(
            "user:read", "user:write", "user:delete",
            "role:read", "role:write", "role:delete",
            "order:read", "order:write", "order:delete",
            "inventory:read", "inventory:write", "report:read",
        )
        oldCodes.forEach { code ->
            permissionRepository.findByCode(code)?.let { permissionRepository.delete(it) }
        }

        val permissions = listOf(
            "iam:user:create" to ("IAM" to "创建用户"),
            "iam:user:read" to ("IAM" to "查看用户"),
            "iam:user:update" to ("IAM" to "编辑用户"),
            "iam:user:delete" to ("IAM" to "删除用户"),
            "iam:user:disable" to ("IAM" to "启用/禁用用户"),
            "iam:user:reset-password" to ("IAM" to "重置密码"),
            "iam:role:create" to ("IAM" to "创建角色"),
            "iam:role:read" to ("IAM" to "查看角色"),
            "iam:role:update" to ("IAM" to "编辑角色"),
            "iam:role:delete" to ("IAM" to "删除角色"),
            "iam:role:assign" to ("IAM" to "分配角色"),
            "iam:permission:read" to ("IAM" to "查看权限"),
            "iam:permission:assign" to ("IAM" to "分配权限"),
            "iam:client:manage" to ("IAM" to "管理客户端"),
            "order:order:create" to ("Order" to "创建订单"),
            "order:order:read" to ("Order" to "查看订单"),
            "order:order:update" to ("Order" to "编辑订单"),
            "order:order:cancel" to ("Order" to "取消订单"),
            "order:shipment:manage" to ("Order" to "物流管理"),
            "iam:category:manage" to ("Order" to "品类管理"),
        )
        permissions.forEach { (code, groupName) ->
            if (permissionRepository.findByCode(code) == null) {
                permissionRepository.save(
                    Permission(code = code, module = groupName.first, name = groupName.second)
                )
            }
        }
    }

    @Bean
    @Order(2)
    fun seedRoles(roleRepository: RoleRepository, permissionRepository: PermissionRepository) = CommandLineRunner {
        val adminRole = if (!roleRepository.existsByName("admin")) {
            roleRepository.save(Role(name = "admin", description = "系统管理员"))
        } else {
            roleRepository.findByName("admin")
        }
        // Always refresh admin role permissions (handles cleanup of stale refs)
        if (adminRole != null) {
            adminRole.permissions.clear()
            adminRole.permissions.addAll(permissionRepository.findAll())
            roleRepository.save(adminRole)
        }
        val buyerRole = if (!roleRepository.existsByName("buyer")) {
            roleRepository.save(Role(name = "buyer", description = "买家"))
        } else {
            roleRepository.findByName("buyer")
        }
        if (buyerRole != null) {
            buyerRole.permissions.clear()
            listOf("order:order:create", "order:order:read").forEach { code ->
                permissionRepository.findByCode(code)?.let { buyerRole.permissions.add(it) }
            }
            roleRepository.save(buyerRole)
        }
        val sellerRole = if (!roleRepository.existsByName("seller")) {
            roleRepository.save(Role(name = "seller", description = "卖家"))
        } else {
            roleRepository.findByName("seller")
        }
        if (sellerRole != null) {
            sellerRole.permissions.clear()
            listOf("order:order:read", "order:order:update", "order:order:cancel", "order:shipment:manage", "iam:category:manage").forEach { code ->
                permissionRepository.findByCode(code)?.let { sellerRole.permissions.add(it) }
            }
            roleRepository.save(sellerRole)
        }
    }

    @Bean
    @Order(3)
    fun seedUsers(
        userRepository: UserRepository,
        roleRepository: RoleRepository,
        passwordEncoder: PasswordEncoder,
    ) = CommandLineRunner {
        val adminRole = roleRepository.findByName("admin")
        val buyerRole = roleRepository.findByName("buyer")
        val sellerRole = roleRepository.findByName("seller")

        // Ensure admin user exists and has admin role
        userRepository.findByUsername("admin")?.let { admin ->
            if (adminRole != null && admin.roles.none { it.name == "admin" }) {
                admin.roles.add(adminRole)
                userRepository.save(admin)
            }
        } ?: run {
            val admin = User(username = "admin", password = passwordEncoder.encode("admin123")!!, email = "admin@simple-oms.local")
            if (adminRole != null) admin.roles.add(adminRole)
            userRepository.save(admin)
        }

        // Ensure test users exist
        listOf("buyer", "buyer1").forEach { uname ->
            if (!userRepository.existsByUsername(uname)) {
                val user = User(username = uname, password = passwordEncoder.encode(uname + "123")!!)
                if (buyerRole != null) user.roles.add(buyerRole)
                userRepository.save(user)
            }
        }
        listOf("seller", "seller1").forEach { uname ->
            if (!userRepository.existsByUsername(uname)) {
                val user = User(username = uname, password = passwordEncoder.encode(uname + "123")!!)
                if (sellerRole != null) user.roles.add(sellerRole)
                userRepository.save(user)
            }
        }
    }
}