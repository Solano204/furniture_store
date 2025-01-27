package com.backend.hotel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
@SpringBootApplication(scanBasePackages = {"com.backend.application", "com.backend.infraestructure"})
@EnableReactiveMongoRepositories(basePackages = "com.backend.Infraestructure.Adapters.Drivens.Repositories")
@EnableMongoAuditing
public class HotelApplication {

	public static void main(String[] args) {
		SpringApplication.run(HotelApplication.class, args);
	}

}
