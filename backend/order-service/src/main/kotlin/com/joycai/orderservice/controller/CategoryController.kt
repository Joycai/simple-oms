package com.joycai.orderservice.controller

import com.joycai.orderservice.model.Category
import com.joycai.orderservice.repository.CategoryRepository
import com.joycai.orderservice.repository.ItemRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1")
class CategoryController(
    private val categoryRepository: CategoryRepository,
    private val itemRepository: ItemRepository,
) {

    @GetMapping("/seller/categories")
    fun listAll(): ResponseEntity<List<Map<String, Any>>> {
        val all = categoryRepository.findAll()
        val l1 = all.filter { it.parentId == null }.map { cat ->
            mapOf(
                "id" to cat.id,
                "name" to cat.name,
                "children" to all.filter { it.parentId == cat.id }.map {
                    mapOf("id" to it.id, "name" to it.name, "parentId" to it.parentId)
                },
            )
        }
        return ResponseEntity.ok(l1)
    }

    @PostMapping("/seller/categories")
    fun create(@RequestBody body: Map<String, String>): ResponseEntity<Map<String, Any>> {
        val name = body["name"] ?: return bad("name required")
        val parentId = body["parentId"]?.toLongOrNull()

        // Validate parentId exists if provided
        if (parentId != null && !categoryRepository.existsById(parentId)) {
            return ResponseEntity.badRequest().body(mapOf("message" to "Parent category $parentId not found"))
        }

        val cat = categoryRepository.save(Category(name = name, parentId = parentId))
        return ResponseEntity.ok(mapOf("id" to cat.id, "name" to cat.name, "parentId" to (cat.parentId ?: "")))
    }

    @PutMapping("/seller/categories/{id}")
    fun update(@PathVariable id: Long, @RequestBody body: Map<String, String>): ResponseEntity<Map<String, Any>> {
        val cat = categoryRepository.findById(id).orElse(null) ?: return ResponseEntity.notFound().build()

        body["parentId"]?.let { rawParentId ->
            val pid = rawParentId.toLongOrNull()
            if (pid != null && !categoryRepository.existsById(pid)) {
                return ResponseEntity.badRequest().body(mapOf("message" to "Parent category $pid not found"))
            }
            cat.parentId = pid
        }
        body["name"]?.let { cat.name = it }
        categoryRepository.save(cat)
        return ResponseEntity.ok(mapOf("id" to cat.id, "name" to cat.name))
    }

    @DeleteMapping("/seller/categories/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Map<String, String>> {
        if (!categoryRepository.existsById(id)) return ResponseEntity.notFound().build()

        // Block delete if child categories exist
        val children = categoryRepository.findByParentId(id)
        if (children.isNotEmpty()) {
            return ResponseEntity.badRequest().body(mapOf("message" to "Cannot delete: category has ${children.size} sub-categories"))
        }

        // Block delete if items reference this category
        val referencedItems = itemRepository.findByCategoryId(id)
        if (referencedItems.isNotEmpty()) {
            return ResponseEntity.badRequest().body(mapOf("message" to "Cannot delete: ${referencedItems.size} items still use this category"))
        }

        categoryRepository.deleteById(id)
        return ResponseEntity.ok(mapOf("message" to "Deleted"))
    }

    private fun bad(msg: String): ResponseEntity<Map<String, Any>> = ResponseEntity.badRequest().body(mapOf("message" to msg))
}
