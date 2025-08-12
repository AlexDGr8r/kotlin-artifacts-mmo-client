package com.artifacts.client

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ArtifactsMmoClientApplication

fun main(args: Array<String>) {
    runApplication<ArtifactsMmoClientApplication>(*args)
}
