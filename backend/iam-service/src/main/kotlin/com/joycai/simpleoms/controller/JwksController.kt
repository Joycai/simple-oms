package com.joycai.simpleoms.controller

import com.joycai.simpleoms.repository.SigningKeyRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import java.security.KeyFactory
import java.security.interfaces.ECPublicKey
import java.security.spec.X509EncodedKeySpec
import java.util.Base64

@RestController
class JwksController(
    private val signingKeyRepository: SigningKeyRepository,
) {

    @GetMapping("/.well-known/jwks.json")
    fun jwks(): ResponseEntity<Map<String, Any>> {
        val keys = signingKeyRepository.findAll().map { key ->
            val pubBytes = parsePem(key.publicKeyPem)
            val pubKey = KeyFactory.getInstance("EC")
                .generatePublic(X509EncodedKeySpec(pubBytes)) as ECPublicKey
            val params = pubKey.params
            val fieldSize = params.curve.field.fieldSize
            val coordLen = (fieldSize + 7) / 8
            val x = encodeCoord(pubKey.w.affineX.toByteArray(), coordLen)
            val y = encodeCoord(pubKey.w.affineY.toByteArray(), coordLen)

            mapOf(
                "kty" to "EC",
                "kid" to key.kid,
                "alg" to key.algorithm,
                "use" to "sig",
                "crv" to "P-256",
                "x" to x,
                "y" to y,
            )
        }
        return ResponseEntity.ok(mapOf("keys" to keys))
    }

    private fun parsePem(pem: String): ByteArray {
        val body = pem
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace("\\s".toRegex(), "")
        return Base64.getDecoder().decode(body)
    }

    private fun encodeCoord(bytes: ByteArray, expectedLen: Int): String {
        // Strip leading sign-byte zeros, pad to expected length
        val unsigned = if (bytes.size > expectedLen)
            bytes.copyOfRange(bytes.size - expectedLen, bytes.size)
        else if (bytes.size < expectedLen)
            ByteArray(expectedLen - bytes.size) + bytes
        else
            bytes
        return Base64.getUrlEncoder().withoutPadding().encodeToString(unsigned)
    }
}
