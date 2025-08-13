package com.artifacts.client.service

import com.artifacts.client.domain.CharacterEntity
import com.artifacts.client.extensions.TaskSchedulerExtensions.afterCooldown
import com.artifacts.client.mappers.CharacterMapper.toEntity
import com.artifacts.client.openapi.models.DestinationSchema
import com.artifacts.client.openapi.models.EquipSchema
import com.artifacts.client.openapi.models.UnequipSchema
import com.artifacts.client.repository.CharacterRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.data.repository.findByIdOrNull
import org.springframework.scheduling.TaskScheduler
import org.springframework.stereotype.Service
import java.time.OffsetDateTime

@Service
class CharacterService(
    private val artifactsApi: ArtifactsApiService,
    private val characterRepo: CharacterRepository,
    private val scheduler: TaskScheduler
) {
    private val log = KotlinLogging.logger {}

    fun forceRefresh(name: String): CharacterEntity {
        val character = artifactsApi.getCharacter(name).data.toEntity()
        return persist(character)
    }

    fun get(name: String): CharacterEntity? = characterRepo.findByIdOrNull(name)

    fun getAll(): List<CharacterEntity> {
        val characters = artifactsApi.getAllCharacters().data
            .map { it.toEntity() }
        characters.forEach(this::persist)
        return characters
    }

    fun move(name: String, destination: DestinationSchema, entity: CharacterEntity? = null): CharacterEntity {
        val character = entity ?: getCharacterFromDB(name)
        if (character?.isAtDestination(destination) == true) {
            log.info { "$name is already at ${destination.x}, ${destination.y}" }
            return character
        }
        val response = artifactsApi.move(name, destination)
        log.info { "$name moved to ${destination.x}, ${destination.y}" }
        return persist(response.data.character.toEntity(), character)
    }

    fun offsetMove(name: String, offset: DestinationSchema) {
        val character = getCharacterFromDB(name) ?: artifactsApi.getCharacter(name).data.toEntity()
        move(name, DestinationSchema(character.x + offset.x, character.y + offset.y), character)
    }

    fun fight(name: String, restAfterFight: Boolean = true) {
        val response = artifactsApi.fight(name).data
        log.info { "$name had a fight: ${response.fight}" }
        persist(response.character.toEntity())
        val character = response.character
        if (restAfterFight && character.hp < character.maxHp) {
            log.info { "$name is below max HP, scheduling rest in ${response.cooldown.remainingSeconds} seconds" }
            scheduler.afterCooldown(response.cooldown) { rest(name) }
        }
    }

    fun rest(name: String): CharacterEntity {
        val response = artifactsApi.rest(name).data
        log.info { "$name had a rest and restored ${response.hpRestored} HP. New HP: ${response.character.hp} / ${response.character.maxHp}" }
        return persist(response.character.toEntity())
    }

    fun gather(name: String): CharacterEntity {
        val response = artifactsApi.gathering(name).data
        log.info { "$name gathered ${response.details.items.size} items gaining ${response.details.xp} XP" }
        return persist(response.character.toEntity())
    }

    fun gatherAt(name: String, destination: DestinationSchema) {
        scheduler.afterCooldown(move(name, destination)) {
            gather(name)
        }
    }

    fun equip(name: String, schema: EquipSchema): CharacterEntity {
        val response = artifactsApi.equip(name, schema).data
        log.info { "$name equipped ${response.item.name} in ${response.slot}" }
        return persist(response.character.toEntity())
    }

    fun unequip(name: String, schema: UnequipSchema): CharacterEntity {
        val response = artifactsApi.unequip(name, schema).data
        log.info { "$name unequipped ${response.item.name} in ${response.slot}" }
        return persist(response.character.toEntity())
    }

    fun isOnCooldown(name: String, entity: CharacterEntity? = null): Boolean {
        val character = entity ?: getCharacterFromDB(name)
        character?.cooldown_expiration?.let {
            return OffsetDateTime.now().isBefore(it)
        }
        return false
    }

    private fun persist(character: CharacterEntity, existing: CharacterEntity? = null): CharacterEntity {
        val existingChar = existing ?: characterRepo.findByIdOrNull(character.name)
        val updatedChar = character.copy(version = existingChar?.version)
        val persistedChar = characterRepo.save(updatedChar)
        log.info { "Character persisted: ${updatedChar.name}" }
        return persistedChar
    }

    private fun getCharacterFromDB(name: String) = characterRepo.findByIdOrNull(name)

    private fun CharacterEntity.isAtDestination(destination: DestinationSchema) =
        this.x == destination.x && this.y == destination.y

}
