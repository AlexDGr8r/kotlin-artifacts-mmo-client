package com.artifacts.client.service

import com.artifacts.client.repository.CharacterRoutineRepository
import com.artifacts.client.routine.Routine
import com.fasterxml.jackson.databind.ObjectMapper
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.ApplicationContext
import org.springframework.stereotype.Service

@Service
class RoutineService(
    private val routineRepository: CharacterRoutineRepository,
    private val applicationContext: ApplicationContext,
    private val mapper: ObjectMapper,
) {
    private val log = KotlinLogging.logger {}

    fun get(character: String) = routineRepository.getByCharacter(character)

    fun <T: Any> start(character: String, routineReq: T) {
        @Suppress("UNCHECKED_CAST")
        findAllRoutines()
            .find { it.getRequestClass().isInstance(routineReq) }
            ?.let {
                val r = (it as Routine<T>)
                storeRoutine(character, r, routineReq)
                r.start(character, routineReq)
            }
            ?: log.warn { "No routine found for request type ${routineReq::class.simpleName}" }
    }

    private fun <T: Any> storeRoutine(character: String, routine: Routine<T>, routineReq: T) {
        routineRepository.getByCharacter(character)?.let { routineRepository.delete(it) }
        val characterRoutine = routine.toStorable(character, routineReq, mapper)
        routineRepository.save(characterRoutine)
    }

    private fun findAllRoutines() = applicationContext.getBeansOfType(Routine::class.java).values

}
