package com.joycai.simpleoms.security

import org.redisson.api.RedissonClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class RefreshTokenService(
    private val redissonClient: RedissonClient,
    @Value("\${jwt.refresh-expiration-ms}") private val refreshExpirationMs: Long,
) {
    private fun key(tokenId: String) = "refresh:$tokenId"

    fun store(tokenId: String, username: String) {
        redissonClient.getBucket<String>(key(tokenId))
            .set(username, Duration.ofMillis(refreshExpirationMs))
    }

    fun isValid(tokenId: String): Boolean =
        redissonClient.getBucket<String>(key(tokenId)).isExists

    fun getUsername(tokenId: String): String? =
        redissonClient.getBucket<String>(key(tokenId)).get()

    fun revoke(tokenId: String) {
        redissonClient.getBucket<String>(key(tokenId)).delete()
    }

    fun revokeAllForUser(username: String) {
        val keys = redissonClient.keys.getKeysStreamByPattern("refresh:*", 100)
        keys.forEach { key ->
            if (redissonClient.getBucket<String>(key).get() == username) {
                redissonClient.getBucket<String>(key).delete()
            }
        }
    }
}
