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
    private fun tokenKey(tokenId: String) = "refresh:$tokenId"
    private fun userTokensKey(username: String) = "refresh:user:$username"

    fun store(tokenId: String, username: String) {
        val ttl = Duration.ofMillis(refreshExpirationMs)
        redissonClient.getBucket<String>(tokenKey(tokenId)).set(username, ttl)
        redissonClient.getSet<String>(userTokensKey(username)).add(tokenId)
        redissonClient.getSet<String>(userTokensKey(username)).expire(ttl)
    }

    fun isValid(tokenId: String): Boolean =
        redissonClient.getBucket<String>(tokenKey(tokenId)).isExists

    fun getUsername(tokenId: String): String? =
        redissonClient.getBucket<String>(tokenKey(tokenId)).get()

    fun revoke(tokenId: String) {
        val username = getUsername(tokenId)
        if (username != null) {
            redissonClient.getSet<String>(userTokensKey(username)).remove(tokenId)
        }
        redissonClient.getBucket<String>(tokenKey(tokenId)).delete()
    }

    fun revokeAllForUser(username: String) {
        val set = redissonClient.getSet<String>(userTokensKey(username))
        val tokenIds = set.readAll()
        tokenIds.forEach { id ->
            redissonClient.getBucket<String>(tokenKey(id)).delete()
        }
        set.delete()
    }
}
