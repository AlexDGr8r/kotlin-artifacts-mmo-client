import kotlin.io.path.invariantSeparatorsPathString

plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    id("org.springframework.boot") version "3.5.4"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.openapi.generator") version "7.14.0"
}

group = "com.artifacts"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-data-jdbc")
    implementation("org.springframework.boot:spring-boot-starter-quartz")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("io.github.oshai:kotlin-logging-jvm:7.0.3")

    compileOnly("org.projectlombok:lombok")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    runtimeOnly("com.h2database:h2")
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

// OpenAPI Generator configuration (Kotlin client using Retrofit2)
openApiGenerate {
    generatorName.set("kotlin")
    inputSpec.set("${rootDir.toPath().invariantSeparatorsPathString}/artifacts-openapi.json")
    outputDir.set("${layout.buildDirectory.get()}/generated")
    apiPackage.set("com.artifacts.client.openapi.apis")
    modelPackage.set("com.artifacts.client.openapi.models")
    invokerPackage.set("com.artifacts.client.openapi.infrastructure")
    library.set("jvm-spring-restclient")
    configOptions.set(mapOf(
        "serializationLibrary" to "jackson",
        "useSpringBoot3" to "true",
        "skipApiResponseGeneration" to "true", // Remove verbose methods
        "simplifyOperationIds" to "true", // Simplify method names
        "omitGradleWrapper" to "true"
    ))
    removeOperationIdPrefix.set(true)
    generateAliasAsModel.set(false)
    skipValidateSpec.set(true)
    globalProperties.set(mapOf(
        "models" to "",
        "modelDocs" to "true",
        "apiDocs" to "true"
    ))
}

sourceSets {
    main {
        kotlin {
            srcDir("${layout.buildDirectory.get()}/generated/src/main/kotlin") // Kotlin sources
        }
    }
}


tasks.named("compileKotlin") {
    dependsOn(tasks.named("openApiGenerate"))
}

tasks.withType<Test> {
    useJUnitPlatform()
}
