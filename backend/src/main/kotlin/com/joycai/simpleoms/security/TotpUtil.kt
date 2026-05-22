package com.joycai.simpleoms.security

import org.apache.commons.codec.binary.Base32
import org.springframework.stereotype.Component
import java.security.SecureRandom
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

@Component
class TotpUtil {

    private val random = SecureRandom()
    private val base32 = Base32()

    fun generateSecret(): String {
        val bytes = ByteArray(20)
        random.nextBytes(bytes)
        return base32.encodeToString(bytes).replace("=", "")
    }

    fun generateQrUrl(secret: String, username: String, issuer: String = "simple-oms"): String {
        return "otpauth://totp/$issuer:$username?secret=$secret&issuer=$issuer"
    }

    fun verifyCode(secret: String, code: String): Boolean {
        val expected = code.toIntOrNull() ?: return false
        val decoded = base32.decode(secret)
        val now = System.currentTimeMillis() / 1000

        // Check current and adjacent time windows (±30s)
        for (offset in -1..1) {
            if (generateTotp(decoded, now / 30 + offset) == expected) return true
        }
        return false
    }

    private fun generateTotp(key: ByteArray, counter: Long): Int {
        val counterBytes = ByteArray(8)
        for (i in 7 downTo 0) {
            counterBytes[i] = (counter and 0xff).toByte()
            // No shift needed with natural truncation from Long
        }
        val hash = hmacSha1(key, counterBytes)
        val offset = hash.last().toInt() and 0x0f
        val binary = ((hash[offset].toInt() and 0x7f) shl 24) or
            ((hash[offset + 1].toInt() and 0xff) shl 16) or
            ((hash[offset + 2].toInt() and 0xff) shl 8) or
            (hash[offset + 3].toInt() and 0xff)
        return binary % 1_000_000
    }

    private fun hmacSha1(key: ByteArray, data: ByteArray): ByteArray {
        val mac = Mac.getInstance("HmacSHA1")
        mac.init(SecretKeySpec(key, "HmacSHA1"))
        return mac.doFinal(data)
    }
}
