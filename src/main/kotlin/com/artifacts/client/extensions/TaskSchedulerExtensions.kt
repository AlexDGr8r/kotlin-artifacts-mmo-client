package com.artifacts.client.extensions

import com.artifacts.client.domain.CharacterEntity
import com.artifacts.client.openapi.models.CharacterSchema
import com.artifacts.client.openapi.models.CooldownSchema
import org.springframework.scheduling.TaskScheduler
import java.time.OffsetDateTime

object TaskSchedulerExtensions {

    inline fun TaskScheduler.afterCooldown(character: CharacterSchema, crossinline block: () -> Unit) =
        afterCooldown(character.cooldownExpiration, block)

    inline fun TaskScheduler.afterCooldown(character: CharacterEntity, crossinline block: () -> Unit) =
        afterCooldown(character.cooldown_expiration, block)

    inline fun TaskScheduler.afterCooldown(cooldown: CooldownSchema, crossinline block: () -> Unit) =
        afterCooldown(cooldown.expiration, block)

    inline fun TaskScheduler.afterCooldown(cooldownExpiration: OffsetDateTime?, crossinline block: () -> Unit) {
        if (cooldownExpiration == null) {
            block()
        } else {
            schedule({ block() }, cooldownExpiration.toInstant())
        }
    }

}