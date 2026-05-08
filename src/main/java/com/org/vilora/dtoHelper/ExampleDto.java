package com.org.vilora.dtoHelper;

import org.springframework.stereotype.Component;

import com.org.vilora.model.Example;
import com.org.vilora.pojo.ExamplePojo;

@Component
public class ExampleDto {

	public ExamplePojo toPojo(Example example){
		
		if(example == null) return null;
		
		ExamplePojo examplePojo = new ExamplePojo();
		examplePojo.setId(example.getId());
		examplePojo.setName(example.getName());
		examplePojo.setEmail(example.getEmail());
		
		return examplePojo;
	}
	
	public Example toModel(ExamplePojo examplePojo){
		
		if(examplePojo == null) return null;
		
		Example example = new Example();
		example.setId(examplePojo.getId());
		example.setName(examplePojo.getName());
		example.setEmail(examplePojo.getEmail());
		
		return example;
	}
}
