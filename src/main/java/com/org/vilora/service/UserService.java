package com.org.vilora.service;

import com.org.vilora.model.User;

public interface UserService{
    public User createUser(User user);

    public boolean existsByEmail(String email);

}
