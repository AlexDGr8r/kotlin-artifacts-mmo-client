package com.artifacts.client.controller

import com.artifacts.client.service.ArtifactsApiService
import com.artifacts.client.service.ItemService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/items")
class ItemController(
    private val itemService: ItemService
) {

    @GetMapping("/{code}")
    fun fetchAndStore(@PathVariable code: String) =
        itemService.get(code) ?: throw NoSuchElementException("Item not found")

    @PostMapping("/find")
    fun findItems(@RequestBody schema: ArtifactsApiService.FindItemsSchema) =
        itemService.findItems(schema)

}
