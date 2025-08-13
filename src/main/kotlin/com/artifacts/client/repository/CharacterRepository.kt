package com.artifacts.client.repository

import com.artifacts.client.domain.CharacterEntity
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface CharacterRepository : CrudRepository<CharacterEntity, String>
