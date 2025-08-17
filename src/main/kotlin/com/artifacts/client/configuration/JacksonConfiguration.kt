package com.artifacts.client.configuration

import com.fasterxml.jackson.databind.module.SimpleModule
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import kotlin.time.Duration

@Configuration
class JacksonConfiguration {

    @Bean
    fun durationModule(): SimpleModule {
        val module = SimpleModule()
        module.addSerializer(Duration::class.java, DurationJsonSerializer())
        module.addDeserializer(Duration::class.java, DurationJsonDeserializer())
        return module
    }

}
