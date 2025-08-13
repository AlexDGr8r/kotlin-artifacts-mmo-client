package com.artifacts.client.configuration

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.MediaType
import org.springframework.web.client.RestClient

@Configuration
class ArtifactsApiConfiguration(
    @param:Value("\${ARTIFACTS_API_TOKEN}")
    private val artifactsApiToken: String
) {

    @Bean
    fun artifactsApiRestClient() = RestClient.builder()
        .baseUrl("https://api.artifactsmmo.com")
        .defaultHeaders {
            it.accept = listOf(MediaType.APPLICATION_JSON)
            it.contentType = MediaType.APPLICATION_JSON
            it.setBearerAuth(artifactsApiToken)
        }
        .build()

}
