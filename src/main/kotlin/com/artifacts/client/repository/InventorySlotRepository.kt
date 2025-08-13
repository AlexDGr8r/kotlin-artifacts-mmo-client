package com.artifacts.client.repository

import com.artifacts.client.domain.InventorySlotEntity
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface InventorySlotRepository : CrudRepository<InventorySlotEntity, Long> {

    fun findAllByCharacter(character: String): List<InventorySlotEntity>

    fun findByCharacterAndSlot(character: String, slot: Int): InventorySlotEntity?

    fun deleteByCharacter(character: String)

}