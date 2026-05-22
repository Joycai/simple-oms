package com.joycai.simpleoms.controller

import com.joycai.simpleoms.dto.AssignRoleRequest
import com.joycai.simpleoms.repository.PermissionRepository
import com.joycai.simpleoms.repository.RoleRepository
import com.joycai.simpleoms.repository.UserRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/admin")
class AdminController(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val permissionRepository: PermissionRepository,
) {

    @GetMapping("/users")
    fun listUsers(): ResponseEntity<List<Map<String, Any>>> {
        val users = userRepository.findAll().map { user ->
            mapOf(
                "id" to user.id,
                "username" to user.username,
                "email" to (user.email ?: ""),
                "enabled" to user.enabled,
                "createdAt" to user.createdAt.toString(),
                "roles" to user.roles.map { mapOf("id" to it.id, "name" to it.name) },
            )
        }
        return ResponseEntity.ok(users)
    }

    @GetMapping("/users/{id}")
    fun getUser(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        val user = userRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(
            mapOf(
                "id" to user.id,
                "username" to user.username,
                "email" to (user.email ?: ""),
                "enabled" to user.enabled,
                "createdAt" to user.createdAt.toString(),
                "roles" to user.roles.map { mapOf("id" to it.id, "name" to it.name) },
            )
        )
    }

    @PutMapping("/users/{id}/roles")
    fun assignRoles(@PathVariable id: Long, @RequestBody request: AssignRoleRequest): ResponseEntity<Map<String, String>> {
        val user = userRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        user.roles.clear()
        user.roles.addAll(roleRepository.findAllById(request.roleIds))
        userRepository.save(user)
        return ResponseEntity.ok(mapOf("message" to "角色已更新"))
    }

    @PutMapping("/users/{id}/toggle")
    fun toggleUser(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        val user = userRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        val updated = userRepository.save(user.copy(enabled = !user.enabled))
        return ResponseEntity.ok(mapOf("id" to updated.id, "enabled" to updated.enabled))
    }

    @GetMapping("/permissions")
    fun listPermissions(): ResponseEntity<List<Map<String, Any>>> {
        val permissions = permissionRepository.findAll()
            .groupBy { it.group }
            .map { (group, perms) ->
                mapOf(
                    "group" to group,
                    "permissions" to perms.map { mapOf("id" to it.id, "code" to it.code, "name" to it.name) },
                )
            }
        return ResponseEntity.ok(permissions)
    }
}
