package com.artifacts.client.routine

import com.artifacts.client.openapi.models.DestinationSchema
import com.artifacts.client.repository.CharacterRoutineRepository
import com.artifacts.client.service.CharacterService
import com.artifacts.client.service.MapService
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.scheduling.TaskScheduler
import org.springframework.stereotype.Component
import kotlin.time.Duration
import kotlin.time.TimeSource
import kotlin.time.TimeSource.Monotonic.ValueTimeMark

@Component
class GatherRoutine(
    private val mapService: MapService,
    private val characterService: CharacterService,
    scheduler: TaskScheduler,
    routineRepository: CharacterRoutineRepository,
) : Routine<GatherRoutine.GatherRoutineReq>(scheduler, routineRepository) {
    private val log = KotlinLogging.logger {}

    override fun start(character: String, req: GatherRoutineReq) {
        val endMark = req.duration?.let { TimeSource.Monotonic.markNow() + it }
        gather(character, req, endMark)
    }

    override fun getRequestClass() = GatherRoutineReq::class.java

    override fun getRoutineName() = "gather"

    private fun gather(character: String, req: GatherRoutineReq, endMark: ValueTimeMark?) {
        var characterEntity = characterService.get(character)
        val charLoc = characterEntity.getLocation()
        val mapResource = mapService.findNearest(charLoc, contentCode = req.gatherResource.contentCode)
        if (mapResource == null) {
            log.warn { "No resource found for $req" }
            return
        }
        endMark?.let {
            if (it.hasPassedNow()) {
                log.info { "Gathering $mapResource has passed end time" }
                return
            }
        }
        if (charLoc.x != mapResource.x || charLoc.y != mapResource.y) {
            log.info { "Moving $character to $mapResource" }
            characterEntity = characterService.move(character, DestinationSchema(mapResource.x, mapResource.y))
        } else {
            log.info { "$character Gathering $mapResource" }
            characterEntity = characterService.gather(character)
        }
        afterCooldown(characterEntity) {
            gather(character, req, endMark)
        }
    }

    data class GatherRoutineReq(
        val gatherResource: GatherResource,
        val duration: Duration? = null,
    )

    enum class GatherResource(
        val contentCode: String
    ) {
        COPPER("copper_rocks"),
        GOLD("gold_rocks"),
        ASH_TREE("ash_tree"),
    }

}
