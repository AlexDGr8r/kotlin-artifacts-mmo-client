package com.artifacts.client.controller

import com.artifacts.client.openapi.models.DestinationSchema
import com.artifacts.client.openapi.models.MapContentType
import com.artifacts.client.openapi.models.MapSchema
import com.artifacts.client.service.MapService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/map")
class MapController(
    private val mapService: MapService
) {

    @GetMapping("/{x}/{y}")
    fun getMap(@PathVariable x: Int, @PathVariable y: Int) = mapService.get(x, y)

    data class FindNearestMapSchema(
        val currLoc: DestinationSchema,
        val contentCode: String? = null,
        val contentType: MapContentType? = null
    )

    @PostMapping("/find/nearest")
    fun findNearestMap(@RequestBody schema: FindNearestMapSchema): MapSchema? {
        if (schema.contentCode == null && schema.contentType == null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Must specify contentCode or contentType"
            )
        }
        return mapService.findNearest(schema.currLoc, schema.contentCode, schema.contentType)
    }

    data class FindMapsSchema(
        val contentCode: String? = null,
        val contentType: MapContentType? = null
    )

    @PostMapping("/find/all")
    fun findNearestMap(@RequestBody schema: FindMapsSchema): List<MapSchema> {
        if (schema.contentCode == null && schema.contentType == null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Must specify contentCode or contentType"
            )
        }
        return mapService.findAll(schema.contentCode, schema.contentType)
    }

}
