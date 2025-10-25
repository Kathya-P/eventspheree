package com.eventsphere.eventsphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.eventsphere.model")
@EnableJpaRepositories("com.eventsphere.repository")
public class EventsphereApplication {

	public static void main(String[] args) {
		SpringApplication.run(EventsphereApplication.class, args);
	}

}
