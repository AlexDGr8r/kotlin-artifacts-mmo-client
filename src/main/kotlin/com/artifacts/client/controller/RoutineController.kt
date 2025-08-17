package com.artifacts.client.controller

import com.artifacts.client.routine.GatherRoutine
import com.artifacts.client.service.RoutineService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/routine")
class RoutineController(
    private val routineService: RoutineService
) {

    @GetMapping("/{character}")
    fun getCurrentRoutine(@PathVariable character: String) =
        routineService.get(character)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Routine not found")

    @PutMapping("/{character}/gather")
    fun gatherRoutine(@PathVariable character: String, @RequestBody req: GatherRoutine.GatherRoutineReq) =
        routineService.start(character, req)

}
