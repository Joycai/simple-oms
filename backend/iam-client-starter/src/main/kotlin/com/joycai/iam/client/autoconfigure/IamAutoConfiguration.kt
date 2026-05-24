package com.joycai.iam.client.autoconfigure

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.AutoConfiguration
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.web.client.RestTemplate
import java.math.BigInteger
import java.security.KeyFactory
import java.security.PublicKey
import java.security.spec.ECPoint
import java.security.spec.ECPublicKeySpec
import java.security.spec.ECGenParameterSpec
import java.security.spec.ECParameterSpec
import java.security.AlgorithmParameters
import java.util.Base64
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

@AutoConfiguration
@EnableConfigurationProperties(IamProperties::class)
class IamAutoConfiguration(
    private val props: IamProperties,
) {
    private val log = LoggerFactory.getLogger(IamAutoConfiguration::class.java)
    private val keyCache = ConcurrentHashMap<String, PublicKey>()
    private val ecSpec: ECParameterSpec by lazy {
        val params = AlgorithmParameters.getInstance("EC")
        params.init(ECGenParameterSpec("secp256r1"))
        params.getParameterSpec(ECParameterSpec::class.java)
    }

    @Bean
    fun iamJwtFilterRegistration(filter: IamJwtAuthFilter): FilterRegistrationBean<IamJwtAuthFilter> {
        val reg = FilterRegistrationBean(filter)
        reg.isEnabled = false // prevent auto-registration; only registered in SecurityFilterChain
        return reg
    }

    @Bean
    fun iamJwtAuthFilter(): IamJwtAuthFilter {
        // Retry JWKS fetch on startup (IAM might not be ready yet)
        for (attempt in 1..5) {
            refreshKeys()
            if (keyCache.isNotEmpty()) {
                log.info("JWKS loaded: ${keyCache.size} key(s)")
                break
            }
            log.warn("JWKS fetch attempt $attempt failed, retrying in 3s...")
            Thread.sleep(3000)
        }
        if (keyCache.isEmpty()) log.error("JWKS: no keys loaded after 5 attempts!")

        Executors.newSingleThreadScheduledExecutor().scheduleWithFixedDelay(
            { try { refreshKeys() } catch (e: Exception) { log.warn("JWKS refresh error: {}", e.message) } },
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

                val x = key["x"] as? String ?: continue
                val y = key["y"] as? String ?: continue

                val xBytes = Base64.getUrlDecoder().decode(x)
                val yBytes = Base64.getUrlDecoder().decode(y)
                val point = ECPoint(BigInteger(1, xBytes), BigInteger(1, yBytes))
                val pubKey = KeyFactory.getInstance("EC")
                    .generatePublic(ECPublicKeySpec(point, ecSpec))
                keyCache[kid] = pubKey
                log.debug("JWKS key loaded: kid={}", kid)
            }
        } catch (e: Exception) {
            log.warn("JWKS refresh failed: {}", e.message)
        }
    }
}
