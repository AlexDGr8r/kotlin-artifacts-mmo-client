package com.artifacts.client.service

import com.artifacts.client.domain.CharacterEntity
import com.artifacts.client.domain.InventorySlotEntity
import com.artifacts.client.extensions.TaskSchedulerExtensions.afterCooldown
import com.artifacts.client.mappers.CharacterMapper.toEntity
import com.artifacts.client.mappers.InventorySlotMapper.toEntity
import com.artifacts.client.openapi.models.CharacterSchema
import com.artifacts.client.openapi.models.DestinationSchema
import com.artifacts.client.openapi.models.EquipSchema
import com.artifacts.client.openapi.models.UnequipSchema
import com.artifacts.client.repository.CharacterRepository
import com.artifacts.client.repository.InventorySlotRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.data.repository.findByIdOrNull
import org.springframework.scheduling.TaskScheduler
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
@Transactional
class CharacterService(
    private val artifactsApi: ArtifactsApiService,
    private val characterRepo: CharacterRepository,
    private val inventorySlotRepo: InventorySlotRepository,
    private val scheduler: TaskScheduler,
    private val itemService: ItemService,
) {
    private val log = KotlinLogging.logger {}

    fun forceRefresh(name: String): CharacterEntity {
        val character = artifactsApi.getCharacter(name).data
        return persist(character)
    }

    fun get(name: String): CharacterEntity? = characterRepo.findByIdOrNull(name)

    fun getAll(): List<CharacterEntity> {
        val characters = artifactsApi.getAllCharacters().data
        return characters.map(this::persist)
    }

    fun getInventory(name: String): Map<Int, InventorySlotEntity> {
        var slots = inventorySlotRepo.findAllByCharacter(name)
        if (slots.isEmpty()) {
            forceRefresh(name)
            slots = inventorySlotRepo.findAllByCharacter(name)
        }
        return slots.associateBy { it.slot }
    }

    fun move(name: String, destination: DestinationSchema, entity: CharacterEntity? = null): CharacterEntity {
        val character = entity ?: getCharacterFromDB(name)
        if (character?.isAtDestination(destination) == true) {
            log.info { "$name is already at ${destination.x}, ${destination.y}" }
            return character
        }
        val response = artifactsApi.move(name, destination)
        log.info { "$name moved to ${destination.x}, ${destination.y}" }
        return persist(response.data.character, character)
    }

    fun fight(name: String, restAfterFight: Boolean = true) {
        val response = artifactsApi.fight(name).data
        log.info { "$name had a fight: ${response.fight}" }
        val character = response.character
        persist(character)
        if (restAfterFight && character.hp < character.maxHp) {
            log.info { "$name is below max HP, scheduling rest in ${response.cooldown.remainingSeconds} seconds" }
            scheduler.afterCooldown(response.cooldown) { rest(name) }
        }
    }

    fun rest(name: String): CharacterEntity {
        val response = artifactsApi.rest(name).data
        log.info { "$name had a rest and restored ${response.hpRestored} HP. New HP: ${response.character.hp} / ${response.character.maxHp}" }
        return persist(response.character)
    }

    fun gather(name: String): CharacterEntity {
        val response = artifactsApi.gathering(name).data
        log.info { "$name gathered ${response.details.items.size} items gaining ${response.details.xp} XP" }
        return persist(response.character)
    }

    fun gatherAt(name: String, destination: DestinationSchema) {
        scheduler.afterCooldown(move(name, destination)) {
            gather(name)
        }
    }

    fun equip(name: String, schema: EquipSchema): CharacterEntity {
        val response = artifactsApi.equip(name, schema).data
        log.info { "$name equipped ${response.item.name} in ${response.slot}" }
        return persist(response.character)
    }

    fun unequip(name: String, schema: UnequipSchema): CharacterEntity {
        val response = artifactsApi.unequip(name, schema).data
        log.info { "$name unequipped ${response.item.name} in ${response.slot}" }
        return persist(response.character)
    }

    fun isOnCooldown(name: String, entity: CharacterEntity? = null): Boolean {
        val character = entity ?: getCharacterFromDB(name)
        character?.cooldown_expiration?.let {
            return OffsetDateTime.now().isBefore(it)
        }
        return false
    }

    fun persist(character: CharacterSchema, existing: CharacterEntity? = null): CharacterEntity {
        val entity = character.toEntity()
        val existingChar = existing ?: characterRepo.findByIdOrNull(character.name)
        val updatedChar = entity.copy(version = existingChar?.version)
        val persistedChar = characterRepo.save(updatedChar)
        log.info { "Character persisted: ${updatedChar.name}" }
        persistInventory(character)
        return persistedChar
    }

    fun persistInventory(character: CharacterSchema) {
        // Easiest to just delete and re-insert all inventory slots
        inventorySlotRepo.deleteByCharacter(character.name)
        val preloadedItems = itemService.getAll(
            character.weaponSlot, character.runeSlot, character.shieldSlot, character.helmetSlot,
            character.bodyArmorSlot, character.legArmorSlot, character.bootsSlot, character.ring1Slot,
            character.ring2Slot, character.amuletSlot, character.artifact1Slot, character.artifact2Slot,
            character.artifact3Slot, character.utility1Slot, character.utility2Slot, character.bagSlot
        )
        character.inventory
            ?.map { it.toEntity(character.name) }
            ?.let { entities ->
                if (entities.isNotEmpty()) {
                    inventorySlotRepo.saveAll(entities)
                    log.info { "Inventory persisted for ${character.name}" }
                    entities.forEach {
                        // Force these to get loaded if not already loaded
                        itemService.get(it.code)
                    }
                    log.info { "Preloaded ${entities.size + preloadedItems.size} items for ${character.name}" }
                } else {
                    log.info { "Inventory cleared for ${character.name} - no items" }
                }
            }
    }

    private fun getCharacterFromDB(name: String) = characterRepo.findByIdOrNull(name)

    private fun CharacterEntity.isAtDestination(destination: DestinationSchema) =
        this.x == destination.x && this.y == destination.y

}
