package com.artifacts.client.mappers

import com.artifacts.client.domain.ItemEntity
import com.artifacts.client.openapi.models.ConditionSchema
import com.artifacts.client.openapi.models.CraftSchema
import com.artifacts.client.openapi.models.ItemSchema
import com.artifacts.client.openapi.models.SimpleEffectSchema
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

object ItemMapper {
    private val mapper = jacksonObjectMapper()

    fun ItemSchema.toEntity(): ItemEntity = ItemEntity(
        name = this.name,
        code = this.code,
        level = this.level,
        type = this.type,
        subtype = this.subtype,
        description = this.description,
        tradeable = this.tradeable,
        conditions_json = this.conditions?.let { mapper.writeValueAsString(it) },
        effects_json = this.effects?.let { mapper.writeValueAsString(it) },
        craft_json = this.craft?.let { mapper.writeValueAsString(it) }
    )

    fun ItemEntity.toSchema(): ItemSchema = ItemSchema(
        name = this.name,
        code = this.code,
        level = this.level,
        type = this.type,
        subtype = this.subtype,
        description = this.description,
        tradeable = this.tradeable,
        conditions = this.conditions_json?.let { json ->
            mapper.readValue(json, object : TypeReference<List<ConditionSchema>>() {})
        },
        effects = this.effects_json?.let { json ->
            mapper.readValue(json, object : TypeReference<List<SimpleEffectSchema>>() {})
        },
        craft = this.craft_json?.let { json ->
            mapper.readValue(json, CraftSchema::class.java)
        }
    )
}