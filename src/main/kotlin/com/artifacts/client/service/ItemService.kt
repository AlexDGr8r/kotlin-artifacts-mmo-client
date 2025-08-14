package com.artifacts.client.service

import com.artifacts.client.domain.CharacterEntity
import com.artifacts.client.domain.CharacterInventory
import com.artifacts.client.domain.ItemEntity
import com.artifacts.client.mappers.ItemMapper.toEntity
import com.artifacts.client.mappers.ItemMapper.toSchema
import com.artifacts.client.openapi.models.ItemSchema
import com.artifacts.client.repository.ItemRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class ItemService(
    private val artifactsApi: ArtifactsApiService,
    private val itemRepo: ItemRepository
) {
    private val log = KotlinLogging.logger {}

    fun fetchAndStore(code: String): ItemEntity {
        log.info { "Item ($code) not found in database, fetching from API"}
        val apiItem = artifactsApi.getItem(code).data
        val existing = itemRepo.findByCode(code)
        val entity = apiItem.toEntity()
        val toSave = existing?.let { entity.copy(id = it.id) } ?: entity
        val saved = itemRepo.save(toSave)
        log.info { "Item persisted: ${saved.code} - ${saved.name}" }
        return saved
    }

    fun fetchAndStoreSchema(code: String): ItemSchema = fetchAndStore(code).toSchema()

    fun get(code: String): ItemSchema? {
        if (code.isBlank()) return null
        log.info { "Fetching item ($code) from database" }
        return itemRepo.findByCode(code)?.toSchema() ?: fetchAndStoreSchema(code)
    }

    fun getAll(vararg codes: String) = codes.mapNotNull { get(it) }

    fun canCraft(itemCode: String, inv: CharacterInventory, character: CharacterEntity): Boolean {
        val item = get(itemCode) ?: return false
        item.craft?.let { craft ->
            val skillLevel = character.getSkillLevel(craft.skill)
            val requiredLevel = craft.level ?: 1
            if (skillLevel < requiredLevel) {
                log.info { "Character ${character.name} does not meet skill level for $itemCode" }
                return false
            }
            craft.items?.forEach { requiredItem ->
                val quantityHave = quantityInInventory(requiredItem.code, inv)
                if (quantityHave < requiredItem.quantity) {
                    log.info { "Character ${character.name} does not have enough ${requiredItem.code} to craft $itemCode" }
                    return false
                }
            }
            return true
        }
        return false
    }

    fun findItemsInInventory(item: String, inv: CharacterInventory) =
        inv.inventory.values.filter { it.code == item }

    fun quantityInInventory(item: String, inv: CharacterInventory) =
        findItemsInInventory(item, inv).sumOf { it.quantity }


}
