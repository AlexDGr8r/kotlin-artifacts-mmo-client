package com.artifacts.client.mappers

import com.artifacts.client.domain.InventorySlotEntity
import com.artifacts.client.openapi.models.InventorySlot

object InventorySlotMapper {

    fun InventorySlot.toEntity(character: String) = InventorySlotEntity(
        character = character,
        slot = this.slot,
        code = this.code,
        quantity = this.quantity,
    )

}