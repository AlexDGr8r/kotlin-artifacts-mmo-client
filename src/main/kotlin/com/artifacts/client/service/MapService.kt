package com.artifacts.client.service

import com.artifacts.client.openapi.models.DestinationSchema
import com.artifacts.client.openapi.models.MapContentType
import com.artifacts.client.openapi.models.MapSchema
import org.springframework.stereotype.Service
import kotlin.math.pow
import kotlin.math.sqrt

@Service
class MapService(
    private val artifactsApi: ArtifactsApiService,
) {

    fun get(x: Int, y: Int) = get(DestinationSchema(x, y))
    
    fun get(loc: DestinationSchema) = artifactsApi.getMap(loc)

    fun findNearest(
        currLoc: DestinationSchema,
        contentCode: String? = null,
        contentType: MapContentType? = null
    ): MapSchema? {
        return findAll(contentCode, contentType)
            .minByOrNull { distance(currLoc, DestinationSchema(it.x, it.y)) }
    }

    fun findAll(
        contentCode: String? = null,
        contentType: MapContentType? = null
    ): List<MapSchema> {
        if (contentCode == null && contentType == null) {
            throw IllegalArgumentException("Must specify contentCode or contentType")
        }
        return getAllPages(contentCode, contentType)
    }

    private fun getAllPages(contentCode: String?, contentType: MapContentType?): List<MapSchema> {
        val resp = artifactsApi.getAllMaps(contentCode, contentType, page = 1, pageSize = 50)
        var page = 1
        val pages = resp.pages ?: 1
        val maps = mutableListOf<MapSchema>()
        maps.addAll(resp.data)
        while (page < pages) {
            val pageResp = artifactsApi.getAllMaps(contentCode, contentType, page = page, pageSize = 50)
            maps.addAll(pageResp.data)
            page++
        }
        return maps
    }

    private fun distance(loc1: DestinationSchema, loc2: DestinationSchema) =
        sqrt((loc2.x - loc1.x).toDouble().pow(2) + (loc2.y - loc1.y).toDouble().pow(2))


}
