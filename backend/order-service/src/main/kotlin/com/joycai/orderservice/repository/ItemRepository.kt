package com.joycai.orderservice.repository

import com.joycai.orderservice.model.Item
import com.joycai.orderservice.model.ItemStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface ItemRepository : JpaRepository<Item, Long> {
    fun findBySellerId(sellerId: String): List<Item>
    fun findByCategoryId(categoryId: Long): List<Item>
    fun findByCategoryIdAndStatus(categoryId: Long, status: ItemStatus): List<Item>
    fun findByStatus(status: ItemStatus): List<Item>
    fun findByNameContainingIgnoreCaseAndStatus(name: String, status: ItemStatus): List<Item>

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Item i SET i.quantity = i.quantity - :qty WHERE i.id = :id AND i.quantity >= :qty")
    fun deductStock(id: Long, qty: Int): Int
}
