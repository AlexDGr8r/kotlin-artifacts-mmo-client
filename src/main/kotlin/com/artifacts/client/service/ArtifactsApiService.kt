package com.artifacts.client.service

import com.artifacts.client.openapi.models.*
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.client.toEntity

@Service
class ArtifactsApiService(
    private val artifactsApiRestClient: RestClient
) {
    private val log = KotlinLogging.logger {}

    fun move(charName: String, schema: DestinationSchema) = artifactsApiRestClient.post()
        .uri("/my/{name}/action/move", charName)
        .body(schema)
        .retrieve()
        .logAndReturnBody<CharacterMovementResponseSchema>()

    fun getCharacter(charName: String) = artifactsApiRestClient.get()
        .uri("/characters/{name}", charName)
        .retrieve()
        .logAndReturnBody<CharacterResponseSchema>()

    fun fight(charName: String) = artifactsApiRestClient.post()
        .uri("/my/{name}/action/fight", charName)
        .retrieve()
        .logAndReturnBody<CharacterFightResponseSchema>()

    fun rest(charName: String) = artifactsApiRestClient.post()
        .uri("/my/{name}/action/rest", charName)
        .retrieve()
        .logAndReturnBody<CharacterRestResponseSchema>()

    fun getAllCharacters() = artifactsApiRestClient.get()
        .uri("/my/characters")
        .retrieve()
        .logAndReturnBody<MyCharactersListSchema>()

    fun gathering(charName: String) = artifactsApiRestClient.post()
        .uri("/my/{name}/action/gathering", charName)
        .retrieve()
        .logAndReturnBody<SkillResponseSchema>()

    fun equip(charName: String, schema: EquipSchema) = artifactsApiRestClient.post()
        .uri("/my/{name}/action/equip", charName)
        .body(schema)
        .retrieve()
        .logAndReturnBody<EquipmentResponseSchema>()

    fun unequip(charName: String, schema: UnequipSchema) = artifactsApiRestClient.post()
        .uri("/my/{name}/action/unequip", charName)
        .body(schema)
        .retrieve()
        .logAndReturnBody<EquipmentResponseSchema>()

    fun getItem(code: String) = artifactsApiRestClient.get()
        .uri("/items/{code}", code)
        .retrieve()
        .logAndReturnBody<ItemResponseSchema>()

    fun craft(charName: String, schema: CraftingSchema) = artifactsApiRestClient.post()
        .uri("/my/{name}/action/crafting", charName)
        .body(schema)
        .retrieve()
        .logAndReturnBody<SkillDataSchema>()

    data class FindItemsSchema(
        val craftMaterial: String? = null,
        val craftSkill: CraftSkill? = null,
        val maxLevel: Int? = null,
        val minLevel: Int? = null,
        val itemName: String? = null,
        val page: Int? = null,
        val pageSize: Int? = null,
        val type: ItemType? = null,
    )

    fun findItems(schema: FindItemsSchema) = artifactsApiRestClient.get()
        .uri { uriBuilder ->
            uriBuilder.path("/items")
            schema.craftMaterial?.let { uriBuilder.queryParam("craft_material", it) }
            schema.craftSkill?.let { uriBuilder.queryParam("craft_skill", it.value) }
            schema.maxLevel?.let { uriBuilder.queryParam("max_level", it) }
            schema.minLevel?.let { uriBuilder.queryParam("min_level", it) }
            schema.itemName?.let { uriBuilder.queryParam("name", it) }
            schema.page?.let { uriBuilder.queryParam("page", it) }
            schema.pageSize?.let { uriBuilder.queryParam("page_size", it) }
            schema.type?.let { uriBuilder.queryParam("type", it.value) }
            uriBuilder.build()
        }
        .retrieve()
        .logAndReturnBody<DataPageItemSchema>()

    fun getAllMaps(
        contentCode: String? = null,
        contentType: MapContentType? = null,
        page: Int = 1,
        pageSize: Int = 50
    ) =
        artifactsApiRestClient
            .get()
            .uri { uriBuilder ->
                uriBuilder.path("/maps")
                contentCode?.let { uriBuilder.queryParam("content_code", it) }
                contentType?.let { uriBuilder.queryParam("content_type", it.value) }
                uriBuilder.queryParam("page", page)
                uriBuilder.queryParam("page_size", pageSize)
                uriBuilder.build()
            }
            .retrieve()
            .logAndReturnBody<DataPageMapSchema>()

    fun getMap(loc: DestinationSchema) = artifactsApiRestClient.get()
        .uri("/maps/{x}/{y}", loc.x, loc.y)
        .retrieve()
        .logAndReturnBody<MapResponseSchema>()

    private inline fun <reified T : Any> RestClient.ResponseSpec.logAndReturnBody(): T {
        val response = toEntity<T>()
        log.info { "Response status code: ${response.statusCode}" }
        log.info { "Response headers: ${response.headers}" }
        log.info { "Response body: ${response.body}" }
        return response.body ?: throw NoSuchElementException("Response body is required")
    }

}




