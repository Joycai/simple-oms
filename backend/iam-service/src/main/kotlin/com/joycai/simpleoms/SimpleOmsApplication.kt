package com.joycai.simpleoms

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class SimpleOmsApplication

fun main(args: Array<String>) {
	runApplication<SimpleOmsApplication>(*args)
}
