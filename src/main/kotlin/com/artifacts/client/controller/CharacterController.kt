package com.artifacts.client.controller

import com.artifacts.client.openapi.models.DestinationSchema
import com.artifacts.client.service.ArtifactsApiService
import com.artifacts.client.service.CharacterService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping

@RestController
@RequestMapping("/character")
class CharacterController(
    private val characterService: CharacterService
) {

    @PutMapping("/{name}/move")
    fun move(@RequestBody destination: DestinationSchema, @PathVariable name: String) =
        characterService.move(name, destination)

    @GetMapping("/{name}/fight")
    fun fight(@PathVariable name: String) = characterService.fight(name)

    @GetMapping("/{name}/refresh")
    fun forceRefresh(@PathVariable name: String) = characterService.forceRefresh(name)

    @GetMapping("/{name}/rest")
    fun rest(@PathVariable name: String) = characterService.rest(name)

}
