package com.org.vilora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.org.vilora.model.Example;

@Repository
public interface ExampleRepository extends JpaRepository<Example, String> {
	
}
