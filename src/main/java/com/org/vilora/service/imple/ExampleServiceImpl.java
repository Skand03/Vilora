package com.org.vilora.service.imple;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.org.vilora.dtoHelper.ExampleDto;
import com.org.vilora.model.Example;
import com.org.vilora.pojo.ExamplePojo;
import com.org.vilora.repository.ExampleRepository;
import com.org.vilora.service.ExampleService;

@Service
public class ExampleServiceImpl implements ExampleService {

	@Autowired
	ExampleRepository egRepo;
	
	@Autowired
	ExampleDto egDto;

	@Override
	public Example save(ExamplePojo examplePojo) {
		Example eg = egDto.toModel(examplePojo);
		egRepo.save(eg);
		
		return eg;
	}

	@Override
	public ExamplePojo getById(String id) {
		Example eg = egRepo.findById(id).orElse(null);
		
		ExamplePojo egPojo = egDto.toPojo(eg);
		return egPojo;
	}
	
	
}
