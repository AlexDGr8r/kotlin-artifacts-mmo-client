package com.artifacts.client.routine

import com.artifacts.client.domain.CharacterEntity
import com.artifacts.client.domain.CharacterRoutine
import com.artifacts.client.extensions.TaskSchedulerExtensions.afterCooldown
import com.artifacts.client.openapi.models.CharacterSchema
import com.artifacts.client.openapi.models.CooldownSchema
import com.artifacts.client.repository.CharacterRoutineRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.scheduling.TaskScheduler
import java.time.OffsetDateTime

abstract class Routine<T: Any>(
    private val scheduler: TaskScheduler,
    private val routineRepo: CharacterRoutineRepository
) {

    abstract fun start(character: String, req: T)

    abstract fun getRequestClass(): Class<T>

    abstract fun getRoutineName(): String

    fun toStorable(character: String, routineReq: T, objectMapper: ObjectMapper): CharacterRoutine {
        return CharacterRoutine(
            character,
            getRoutineName(),
            objectMapper.writeValueAsString(routineReq))
    }

    protected fun getRoutine(character: String): CharacterRoutine? = routineRepo.getByCharacter(character)

    protected fun cancelRoutine(character: String) {
        routineRepo.getByCharacter(character)?.let { routineRepo.delete(it)}
    }

    protected fun afterCooldown(character: CharacterSchema, block: () -> Unit) =
        afterCooldown(character.cooldownExpiration, character.name, block)

    protected fun afterCooldown(character: CharacterEntity, block: () -> Unit) =
        afterCooldown(character.cooldown_expiration, character.name, block)

    protected fun afterCooldown(cooldown: CooldownSchema, character: String, block: () -> Unit) =
        afterCooldown(cooldown.expiration, character, block)

    protected fun afterCooldown(cooldownExpiration: OffsetDateTime?, character: String, block: () -> Unit) {
        scheduler.afterCooldown(cooldownExpiration) {
            getRoutine(character)?.let { routine ->
                if (routine.routine != getRoutineName()) {
                    // Not our routine anymore, stop processing
                    return@afterCooldown
                }
                block()
            }
            // No routine in DB = routine stopped, so don't do anything
        }
    }

}