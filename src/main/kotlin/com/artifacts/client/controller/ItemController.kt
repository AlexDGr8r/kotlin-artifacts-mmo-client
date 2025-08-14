package com.artifacts.client.controller

import com.artifacts.client.service.ItemService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/items")
class ItemController(
    private val itemService: ItemService
) {

    @GetMapping("/{code}")
    fun fetchAndStore(@PathVariable code: String) =
        itemService.get(code) ?: throw NoSuchElementException("Item not found")

}
