package com.org.vilora.service;

import com.org.vilora.model.Example;
import com.org.vilora.pojo.ExamplePojo;

public interface ExampleService {

	public Example save(ExamplePojo examplePojo);
	public ExamplePojo getById(String id);
}
