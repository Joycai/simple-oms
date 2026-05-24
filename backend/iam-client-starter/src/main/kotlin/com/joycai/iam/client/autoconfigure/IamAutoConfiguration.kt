package com.joycai.iam.client.autoconfigure

import org.springframework.boot.autoconfigure.AutoConfiguration
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.web.client.RestTemplate
import java.security.KeyFactory
import java.security.PublicKey
import java.security.spec.X509EncodedKeySpec
import java.util.Base64
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

@AutoConfiguration
@EnableConfigurationProperties(IamProperties::class)
class IamAutoConfiguration(
    private val props: IamProperties,
) {
    private val keyCache = ConcurrentHashMap<String, PublicKey>()

    @Bean
    fun iamJwtAuthFilter(): IamJwtAuthFilter {
        // Initial fetch
        refreshKeys()
        // Periodic refresh every 5 minutes
        Executors.newSingleThreadScheduledExecutor().scheduleWithFixedDelay(
            { try { refreshKeys() } catch (_: Exception) {} },
            5, 5, TimeUnit.MINUTES,
        )
        return IamJwtAuthFilter { keyCache.values.toList() }
    }

    private fun refreshKeys() {
        try {
            val rest = RestTemplate()
            val jwksUrl = "${props.authServerUrl}/.well-known/jwks.json"
            val json = rest.getForObject(jwksUrl, Map::class.java) ?: return
            @Suppress("UNCHECKED_CAST")
            val keys = json["keys"] as? List<Map<String, Any>> ?: return

            for (key in keys) {
                val kid = key["kid"] as? String ?: continue
                val kty = key["kty"] as? String ?: continue
                if (kty != "EC") continue

                // Reconstruct EC public key from JWKS
                val x = key["x"] as? String ?: continue
                val y = key["y"] as? String ?: continue

                // Build uncompressed EC point: 0x04 || x || y
                val xBytes = Base64.getUrlDecoder().decode(x)
                val yBytes = Base64.getUrlDecoder().decode(y)
                val point = byteArrayOf(0x04) + xBytes + yBytes

                // Create X.509 SubjectPublicKeyInfo manually for P-256
                // Algorithm OID: 1.2.840.10045.2.1 (EC)
                // Curve OID: 1.2.840.10045.3.1.7 (P-256)
                val ecPublicKeyBytes = buildEcPublicKeyDer(point)
                val pubKey = KeyFactory.getInstance("EC")
                    .generatePublic(X509EncodedKeySpec(ecPublicKeyBytes))
                keyCache[kid] = pubKey
            }
        } catch (_: Exception) {
            // Keep existing cache on failure
        }
    }

    private fun buildEcPublicKeyDer(point: ByteArray): ByteArray {
        // OID for EC public key: 1.2.840.10045.2.1
        val ecOid = byteArrayOf(0x06, 0x07, 0x2a.toByte(), 0x86.toByte(), 0x48.toByte(), 0xce.toByte(), 0x3d.toByte(), 0x02, 0x01)
        // OID for P-256 curve: 1.2.840.10045.3.1.7
        val p256Oid = byteArrayOf(0x06, 0x08, 0x2a.toByte(), 0x86.toByte(), 0x48.toByte(), 0xce.toByte(), 0x3d.toByte(), 0x03, 0x01, 0x07)
        // AlgorithmIdentifier: SEQUENCE { ecOid + p256Oid }
        val algId = byteArrayOf(0x30, 0x13) + ecOid + p256Oid
        // SubjectPublicKeyInfo: SEQUENCE { algId + BIT STRING(point) }
        val bitString = byteArrayOf(0x03, (point.size + 1).toByte(), 0x00) + point
        val totalLen = algId.size + bitString.size
        return byteArrayOf(0x30, totalLen.toByte()) + algId + bitString
    }
}
