package com.org.vilora.service;

import com.org.vilora.entity.User;

public interface UserService{
    public User createUser(User user);

    public boolean existsByEmail(String email);

}
