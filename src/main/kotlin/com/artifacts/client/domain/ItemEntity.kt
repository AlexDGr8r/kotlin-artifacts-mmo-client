package com.artifacts.client.domain

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table

@Table("ITEMS")
data class ItemEntity(
    val name: String,
    val code: String,
    val level: Int,
    val type: String,
    val subtype: String,
    val description: String,
    val tradeable: Boolean,
    // Store nested properties as JSON text for completeness
    val conditions_json: String? = null,
    val effects_json: String? = null,
    val craft_json: String? = null,
    @Id
    val id: Long? = null,
)