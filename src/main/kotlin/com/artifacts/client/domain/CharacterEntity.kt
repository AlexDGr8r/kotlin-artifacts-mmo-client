package com.artifacts.client.domain

import com.artifacts.client.openapi.models.CraftSkill
import com.artifacts.client.openapi.models.DestinationSchema
import com.artifacts.client.openapi.models.Skill
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.Version
import org.springframework.data.relational.core.mapping.Table
import java.time.OffsetDateTime

@Table("CHARACTERS")
data class CharacterEntity(
    @Id val name: String,
    val account: String,
    val skin: String,
    val level: Int,
    val xp: Int,
    val max_xp: Int,
    val gold: Int,
    val speed: Int,
    val mining_level: Int,
    val mining_xp: Int,
    val mining_max_xp: Int,
    val woodcutting_level: Int,
    val woodcutting_xp: Int,
    val woodcutting_max_xp: Int,
    val fishing_level: Int,
    val fishing_xp: Int,
    val fishing_max_xp: Int,
    val weaponcrafting_level: Int,
    val weaponcrafting_xp: Int,
    val weaponcrafting_max_xp: Int,
    val gearcrafting_level: Int,
    val gearcrafting_xp: Int,
    val gearcrafting_max_xp: Int,
    val jewelrycrafting_level: Int,
    val jewelrycrafting_xp: Int,
    val jewelrycrafting_max_xp: Int,
    val cooking_level: Int,
    val cooking_xp: Int,
    val cooking_max_xp: Int,
    val alchemy_level: Int,
    val alchemy_xp: Int,
    val alchemy_max_xp: Int,
    val hp: Int,
    val max_hp: Int,
    val haste: Int,
    val critical_strike: Int,
    val wisdom: Int,
    val prospecting: Int,
    val attack_fire: Int,
    val attack_earth: Int,
    val attack_water: Int,
    val attack_air: Int,
    val dmg: Int,
    val dmg_fire: Int,
    val dmg_earth: Int,
    val dmg_water: Int,
    val dmg_air: Int,
    val res_fire: Int,
    val res_earth: Int,
    val res_water: Int,
    val res_air: Int,
    val x: Int,
    val y: Int,
    val cooldown: Int,
    val weapon_slot: String,
    val rune_slot: String,
    val shield_slot: String,
    val helmet_slot: String,
    val body_armor_slot: String,
    val leg_armor_slot: String,
    val boots_slot: String,
    val ring1_slot: String,
    val ring2_slot: String,
    val amulet_slot: String,
    val artifact1_slot: String,
    val artifact2_slot: String,
    val artifact3_slot: String,
    val utility1_slot: String,
    val utility1_slot_quantity: Int,
    val utility2_slot: String,
    val utility2_slot_quantity: Int,
    val bag_slot: String,
    val task: String,
    val task_type: String,
    val task_progress: Int,
    val task_total: Int,
    val inventory_max_items: Int,
    val cooldown_expiration: OffsetDateTime?,
    @Version
    var version: Int? = null
) {
    fun getSkillLevel(skill: Skill?): Int {
        return when (skill) {
            Skill.weaponcrafting -> weaponcrafting_level
            Skill.gearcrafting -> gearcrafting_level
            Skill.jewelrycrafting -> jewelrycrafting_level
            Skill.cooking -> cooking_level
            Skill.woodcutting -> woodcutting_level
            Skill.mining -> mining_level
            Skill.alchemy -> alchemy_level
            Skill.fishing -> fishing_level
            else -> 1
        }
    }

    fun getSkillLevel(skill: CraftSkill?): Int {
        return when (skill) {
            CraftSkill.weaponcrafting -> weaponcrafting_level
            CraftSkill.gearcrafting -> gearcrafting_level
            CraftSkill.jewelrycrafting -> jewelrycrafting_level
            CraftSkill.cooking -> cooking_level
            CraftSkill.woodcutting -> woodcutting_level
            CraftSkill.mining -> mining_level
            CraftSkill.alchemy -> alchemy_level
            else -> 1
        }
    }

    fun getLocation() = DestinationSchema(x, y)

}
