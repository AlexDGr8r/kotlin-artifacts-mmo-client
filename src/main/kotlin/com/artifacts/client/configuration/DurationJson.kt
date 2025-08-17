package com.artifacts.client.configuration

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.SerializerProvider
import kotlin.time.Duration

class DurationJsonSerializer : JsonSerializer<Duration>() {
    override fun serialize(
        value: Duration,
        gen: JsonGenerator,
        serializers: SerializerProvider
    ) {
        gen.writeString(value.toIsoString())
    }
}

class DurationJsonDeserializer : JsonDeserializer<Duration>() {
    override fun deserialize(
        parser: JsonParser,
        ctxt: DeserializationContext
    ): Duration {
        val value = parser.text
        return Duration.parse(value)
    }
}