package com.artifacts.client.domain

import com.artifacts.client.mappers.CharacterMapper.toEntity
import com.artifacts.client.mappers.InventorySlotMapper.toEntity
import com.artifacts.client.openapi.models.CharacterSchema

data class CharacterInventory(
    val inventory: Map<Int, InventorySlotEntity>,
    val equipped: Map<EquipmentSlot, String>,
    val maxItems: Int,
    val gold: Int,
) {
    constructor(character: CharacterEntity, inventory: Map<Int, InventorySlotEntity>) :
            this(
                inventory,
                mapOf(
                    EquipmentSlot.Weapon to character.weapon_slot,
                    EquipmentSlot.Rune to character.rune_slot,
                    EquipmentSlot.Shield to character.shield_slot,
                    EquipmentSlot.Helmet to character.helmet_slot,
                    EquipmentSlot.BodyArmor to character.body_armor_slot,
                    EquipmentSlot.LegArmor to character.leg_armor_slot,
                    EquipmentSlot.Boots to character.boots_slot,
                    EquipmentSlot.Ring1 to character.ring1_slot,
                    EquipmentSlot.Ring2 to character.ring2_slot,
                    EquipmentSlot.Amulet to character.amulet_slot,
                    EquipmentSlot.Artifact1 to character.artifact1_slot,
                    EquipmentSlot.Artifact2 to character.artifact2_slot,
                    EquipmentSlot.Artifact3 to character.artifact3_slot,
                    EquipmentSlot.Utility1 to character.utility1_slot,
                    EquipmentSlot.Utility2 to character.utility2_slot,
                    EquipmentSlot.Bag to character.bag_slot,
                ),
                character.inventory_max_items,
                character.gold,
            )

    constructor(character: CharacterSchema) :
            this(
                character.toEntity(),
                character.inventory
                    ?.map { it.toEntity(character.name) }
                    ?.associateBy { it.slot }
                    ?: emptyMap<Int, InventorySlotEntity>()
            )

    enum class EquipmentSlot(val slot: String) {
        Weapon("weapon_slot"),
        Rune("rune_slot"),
        Shield("shield_slot"),
        Helmet("helmet_slot"),
        BodyArmor("body_armor_slot"),
        LegArmor("leg_armor_slot"),
        Boots("boots_slot"),
        Ring1("ring1_slot"),
        Ring2("ring2_slot"),
        Amulet("amulet_slot"),
        Artifact1("artifact1_slot"),
        Artifact2("artifact2_slot"),
        Artifact3("artifact3_slot"),
        Utility1("utility1_slot"),
        Utility2("utility2_slot"),
        Bag("bag_slot"),
    }
}
