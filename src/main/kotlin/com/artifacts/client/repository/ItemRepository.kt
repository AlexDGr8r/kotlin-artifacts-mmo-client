package com.artifacts.client.repository

import com.artifacts.client.domain.ItemEntity
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface ItemRepository : CrudRepository<ItemEntity, Long> {
    fun findByCode(code: String): ItemEntity?
}