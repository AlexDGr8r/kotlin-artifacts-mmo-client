package com.artifacts.client.service

import com.artifacts.client.openapi.models.CharacterFightDataSchema
import com.artifacts.client.openapi.models.CharacterFightResponseSchema
import com.artifacts.client.openapi.models.CharacterMovementResponseSchema
import com.artifacts.client.openapi.models.CharacterResponseSchema
import com.artifacts.client.openapi.models.CharacterRestResponseSchema
import com.artifacts.client.openapi.models.DestinationSchema
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

    private inline fun <reified T : Any> RestClient.ResponseSpec.logAndReturnBody(): T {
        val response = toEntity<T>()
        log.info { "Response status code: ${response.statusCode}" }
        log.info { "Response headers: ${response.headers}" }
        log.info { "Response body: ${response.body}" }
        return response.body ?: throw NoSuchElementException("Response body is required")
    }

}




