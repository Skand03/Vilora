package com.org.vilora.service;

import com.org.vilora.model.Example;
import com.org.vilora.pojo.ExamplePojo;

public interface ExampleService {

	public void register(Example example);
	public ExamplePojo getById(String id);
}
