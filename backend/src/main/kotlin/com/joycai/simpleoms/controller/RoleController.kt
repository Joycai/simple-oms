package com.joycai.simpleoms.controller

import com.joycai.simpleoms.dto.AssignPermissionRequest
import com.joycai.simpleoms.dto.RoleRequest
import com.joycai.simpleoms.model.Role
import com.joycai.simpleoms.repository.PermissionRepository
import com.joycai.simpleoms.repository.RoleRepository
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/roles")
@PreAuthorize("hasRole('admin')")
class RoleController(
    private val roleRepository: RoleRepository,
    private val permissionRepository: PermissionRepository,
) {

    @GetMapping
    fun list(): ResponseEntity<List<Map<String, Any>>> {
        val roles = roleRepository.findAll().map { role ->
            mapOf(
                "id" to role.id,
                "name" to role.name,
                "description" to (role.description ?: ""),
                "permissionCount" to role.permissions.size,
                "userCount" to role.users.size,
                "permissions" to role.permissions.map { it.id },
            )
        }
        return ResponseEntity.ok(roles)
    }

    @PostMapping
    fun create(@Valid @RequestBody request: RoleRequest): ResponseEntity<Map<String, Any>> {
        if (roleRepository.existsByName(request.name)) {
            return ResponseEntity.badRequest().body(mapOf("message" to "角色名已存在"))
        }
        val role = roleRepository.save(Role(name = request.name, description = request.description))
        return ResponseEntity.ok(mapOf("id" to role.id, "name" to role.name))
    }

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: RoleRequest): ResponseEntity<Map<String, Any>> {
        val role = roleRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        if (role.name == "admin") return ResponseEntity.badRequest().body(mapOf("message" to "admin 角色不可修改"))
        if (request.name != role.name && roleRepository.existsByName(request.name)) {
            return ResponseEntity.badRequest().body(mapOf("message" to "角色名已存在"))
        }
        roleRepository.save(Role(id = role.id, name = request.name, description = request.description))
        return ResponseEntity.ok(mapOf("id" to role.id, "name" to request.name))
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    fun delete(@PathVariable id: Long): ResponseEntity<Map<String, String>> {
        val role = roleRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        if (role.name == "admin") return ResponseEntity.badRequest().body(mapOf("message" to "admin 角色不可删除"))
        roleRepository.deleteById(id)
        return ResponseEntity.ok(mapOf("message" to "已删除"))
    }

    @GetMapping("/{id}/permissions")
    fun getPermissions(@PathVariable id: Long): ResponseEntity<List<Long>> {
        val role = roleRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(role.permissions.map { it.id })
    }

    @PutMapping("/{id}/permissions")
    fun assignPermissions(@PathVariable id: Long, @RequestBody request: AssignPermissionRequest): ResponseEntity<Map<String, String>> {
        val role = roleRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        if (role.name == "admin" && request.permissionIds.isEmpty()) {
            return ResponseEntity.badRequest().body(mapOf("message" to "admin 角色必须保留至少一项权限"))
        }
        role.permissions.clear()
        role.permissions.addAll(permissionRepository.findAllById(request.permissionIds))
        roleRepository.save(role)
        return ResponseEntity.ok(mapOf("message" to "权限已更新"))
    }
}
