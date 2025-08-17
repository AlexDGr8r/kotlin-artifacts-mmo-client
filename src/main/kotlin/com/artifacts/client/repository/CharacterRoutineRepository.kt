package com.artifacts.client.repository

import com.artifacts.client.domain.CharacterRoutine
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface CharacterRoutineRepository : CrudRepository<CharacterRoutine, Long> {

    fun getByCharacter(character: String): CharacterRoutine?

}