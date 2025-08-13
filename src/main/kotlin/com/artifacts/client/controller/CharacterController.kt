package com.artifacts.client.controller

import com.artifacts.client.openapi.models.DestinationSchema
import com.artifacts.client.service.CharacterService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/character")
class CharacterController(
    private val characterService: CharacterService
) {

    @GetMapping("/{name}")
    fun get(@PathVariable name: String) = characterService.get(name)

    @GetMapping("/all")
    fun getAll() = characterService.getAll()

    @PutMapping("/{name}/move")
    fun move(@RequestBody destination: DestinationSchema, @PathVariable name: String) =
        characterService.move(name, destination)

    @GetMapping("/{name}/fight")
    fun fight(@PathVariable name: String, @RequestParam rest: Boolean = true) =
        characterService.fight(name, rest)

    @GetMapping("/{name}/refresh")
    fun forceRefresh(@PathVariable name: String) = characterService.forceRefresh(name)

    @GetMapping("/{name}/rest")
    fun rest(@PathVariable name: String) = characterService.rest(name)

    @GetMapping("/{name}/cooldown")
    fun isOnCooldown(@PathVariable name: String) =
        "$name on cooldown: ${characterService.isOnCooldown(name)}"

}
