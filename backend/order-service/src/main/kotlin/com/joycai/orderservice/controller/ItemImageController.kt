package com.joycai.orderservice.controller

import com.joycai.orderservice.model.ItemImage
import com.joycai.orderservice.repository.ItemImageRepository
import com.joycai.orderservice.repository.ItemRepository
import com.joycai.orderservice.service.ImageStorageService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.security.MessageDigest

@RestController
@RequestMapping("/api/v1")
class ItemImageController(
    private val itemImageRepository: ItemImageRepository,
    private val itemRepository: ItemRepository,
    private val imageStorageService: ImageStorageService,
) {

    // ── Public: list images for an item ──────────────────────────────

    @GetMapping("/items/{itemId}/images")
    fun listImages(@PathVariable itemId: Long): ResponseEntity<List<Map<String, Any>>> {
        val images = itemImageRepository.findByItemIdOrderBySortOrder(itemId).map {
            mapOf(
                "id" to it.id,
                "itemId" to it.itemId,
                "url" to "/api/v1/images/${it.path}",
                "sortOrder" to it.sortOrder,
            )
        }
        return ResponseEntity.ok(images)
    }

    // ── Public: serve image file ──────────────────────────────────────

    @GetMapping("/images/**")
    fun serveImage(request: jakarta.servlet.http.HttpServletRequest): ResponseEntity<ByteArray> {
        val prefix = "/api/v1/images/"
        val relPath = request.requestURI.substringAfter(prefix)
        val (bytes, mime) = imageStorageService.load(relPath)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(mime))
            .body(bytes)
    }

    // ── Seller: upload image (accepts base64 data URI or raw base64) ──

    @PostMapping("/seller/items/{itemId}/images")
    fun uploadImage(
        @PathVariable itemId: Long,
        @RequestBody body: Map<String, Any>,
        @AuthenticationPrincipal sellerId: String,
    ): ResponseEntity<Map<String, Any>> {
        val item = itemRepository.findById(itemId).orElse(null)
            ?: return ResponseEntity.notFound().build()
        if (item.sellerId != sellerId) return ResponseEntity.status(403).body(mapOf("message" to "Access denied"))

        val data = body["data"] as? String
            ?: return ResponseEntity.badRequest().body(mapOf("message" to "data required"))

        // Rough size guard: base64 of 5 MB ≈ 6_800_000 chars
        if (data.length > 6_800_000) return ResponseEntity.badRequest()
            .body(mapOf("message" to "Image too large (max 5 MB)"))

        val hash = MessageDigest.getInstance("SHA-256")
            .digest(data.toByteArray())
            .joinToString("") { "%02x".format(it) }

        // Dedup by content hash
        val existing = itemImageRepository.findByItemIdOrderBySortOrder(itemId)
        existing.firstOrNull { it.contentHash == hash }?.let { dup ->
            return ResponseEntity.ok(mapOf("id" to dup.id, "skipped" to true, "url" to "/api/v1/images/${dup.path}"))
        }

        val path = imageStorageService.save(itemId, hash, data)
        val image = itemImageRepository.save(
            ItemImage(itemId = itemId, path = path, contentHash = hash, sortOrder = existing.size)
        )
        return ResponseEntity.ok(mapOf("id" to image.id, "sortOrder" to image.sortOrder, "url" to "/api/v1/images/$path"))
    }

    // ── Seller: reorder images ────────────────────────────────────────

    @PutMapping("/seller/items/{itemId}/images/reorder")
    fun reorderImages(
        @PathVariable itemId: Long,
        @RequestBody body: Map<String, Any>,
        @AuthenticationPrincipal sellerId: String,
    ): ResponseEntity<Map<String, String>> {
        val item = itemRepository.findById(itemId).orElse(null) ?: return ResponseEntity.notFound().build()
        if (item.sellerId != sellerId) return ResponseEntity.status(403).body(mapOf("message" to "Access denied"))

        @Suppress("UNCHECKED_CAST")
        val order = body["ids"] as? List<Int>
            ?: return ResponseEntity.badRequest().body(mapOf("message" to "ids required"))

        order.forEachIndexed { index, id ->
            val img = itemImageRepository.findById(id.toLong()).orElse(null)
            if (img != null && img.itemId == itemId) {
                img.sortOrder = index
                itemImageRepository.save(img)
            }
        }
        return ResponseEntity.ok(mapOf("message" to "Reordered"))
    }

    // ── Seller: delete image ──────────────────────────────────────────

    @DeleteMapping("/seller/item-images/{id}")
    fun deleteImage(@PathVariable id: Long, @AuthenticationPrincipal sellerId: String): ResponseEntity<Map<String, String>> {
        val img = itemImageRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()
        val item = itemRepository.findById(img.itemId).orElse(null)
        if (item?.sellerId != sellerId) return ResponseEntity.status(403).body(mapOf("message" to "Access denied"))
        imageStorageService.delete(img.path)
        itemImageRepository.delete(img)
        return ResponseEntity.ok(mapOf("message" to "Deleted"))
    }
}
