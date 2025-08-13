package com.artifacts.client.domain

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table

@Table("INVENTORY_SLOTS")
data class InventorySlotEntity(
    val character: String,
    val slot: Int,
    val code: String,
    val quantity: Int,
    @Id
    val id: Long? = null,
)