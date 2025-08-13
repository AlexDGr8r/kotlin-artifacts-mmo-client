package com.artifacts.client.service

import com.artifacts.client.domain.CharacterEntity
import com.artifacts.client.mappers.CharacterMapper.toEntity
import com.artifacts.client.openapi.models.DestinationSchema
import com.artifacts.client.repository.CharacterRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service

@Service
class CharacterService(
    private val artifactsApi: ArtifactsApiService,
    private val characterRepo: CharacterRepository
) {
    private val log = KotlinLogging.logger {}

    fun forceRefresh(name: String) {
        val character = artifactsApi.getCharacter(name).data.toEntity()
        persist(character)
    }

    fun move(name: String, destination: DestinationSchema, entity: CharacterEntity? = null) {
        val character = entity ?: getCharacterFromDB(name)
        if (character?.isAtDestination(destination) == true) {
            log.info { "$name is already at ${destination.x}, ${destination.y}" }
            return
        }
        val response = artifactsApi.move(name, destination)
        log.info { "$name moved to ${destination.x}, ${destination.y}" }
        persist(response.data.character.toEntity(), character)
    }

    fun offsetMove(name: String, offset: DestinationSchema) {
        val character = getCharacterFromDB(name) ?: artifactsApi.getCharacter(name).data.toEntity()
        move(name, DestinationSchema(character.x + offset.x, character.y + offset.y), character)
    }

    fun fight(name: String) {
        val response = artifactsApi.fight(name).data
        log.info { "$name had a fight: ${response.fight}" }
        persist(response.character.toEntity())
    }

    fun rest(name: String) {
        val response = artifactsApi.rest(name).data
        log.info { "$name had a rest and restored ${response.hpRestored} HP. New HP: ${response.character.hp} / ${response.character.maxHp}" }
        persist(response.character.toEntity())
    }

    private fun persist(character: CharacterEntity, existing: CharacterEntity? = null) {
        val existingChar = existing ?: characterRepo.findByIdOrNull(character.name)
        val updatedChar = character.copy(version = existingChar?.version)
        characterRepo.save(updatedChar)
        log.info { "Character persisted: ${updatedChar.name}" }
    }

    private fun getCharacterFromDB(name: String) = characterRepo.findByIdOrNull(name)

    private fun CharacterEntity.isAtDestination(destination: DestinationSchema) =
        this.x == destination.x && this.y == destination.y

}
