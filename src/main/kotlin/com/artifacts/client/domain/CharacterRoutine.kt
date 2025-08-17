package com.artifacts.client.domain

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table

@Table("CHARACTER_ROUTINES")
data class CharacterRoutine(
    val character: String,
    val routine: String,
    val request_json: String? = null,
    @Id
    val id: Long? = null,
)