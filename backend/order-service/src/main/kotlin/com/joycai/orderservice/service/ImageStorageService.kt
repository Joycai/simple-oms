package com.joycai.orderservice.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.io.File
import java.nio.file.Files
import java.nio.file.Paths
import java.util.Base64

@Service
class ImageStorageService(
    @Value("\${app.upload-dir:./uploads}") private val uploadDir: String,
) {
    /**
     * Decode a base64 string (with or without the "data:image/...;base64," prefix),
     * save it under {uploadDir}/items/{itemId}/{hash}.{ext}, and return the relative path.
     */
    fun save(itemId: Long, hash: String, base64Data: String): String {
        val (mimeType, rawBase64) = stripDataUri(base64Data)
        val ext = mimeTypeToExt(mimeType)
        val bytes = Base64.getDecoder().decode(rawBase64)

        val relPath = "items/$itemId/$hash.$ext"
        val target = Paths.get(uploadDir, relPath).toFile()
        target.parentFile.mkdirs()
        target.writeBytes(bytes)
        return relPath
    }

    /** Read and return the bytes of a stored image, or null if not found. */
    fun load(relPath: String): Pair<ByteArray, String>? {
        val file = Paths.get(uploadDir, relPath).toFile()
        if (!file.exists()) return null
        val mime = Files.probeContentType(file.toPath()) ?: "application/octet-stream"
        return file.readBytes() to mime
    }

    /** Delete a stored image file (best-effort). */
    fun delete(relPath: String) {
        val file = Paths.get(uploadDir, relPath).toFile()
        file.delete()
    }

    // ── helpers ───────────────────────────────────────────────────────

    private fun stripDataUri(data: String): Pair<String?, String> {
        val prefix = Regex("^data:([^;]+);base64,")
        val match = prefix.find(data)
        return if (match != null) {
            match.groupValues[1] to data.substring(match.value.length)
        } else {
            null to data
        }
    }

    private fun mimeTypeToExt(mimeType: String?): String = when (mimeType) {
        "image/jpeg" -> "jpg"
        "image/png"  -> "png"
        "image/gif"  -> "gif"
        "image/webp" -> "webp"
        else         -> "bin"
    }
}
