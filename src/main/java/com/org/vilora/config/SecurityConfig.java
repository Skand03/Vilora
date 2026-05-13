package com.org.vilora.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    protected UserDetailsService getUserDetailsService(){
        return new UserDetailsServiceImpl();
    }


    @Bean
    public BCryptPasswordEncoder getPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider authProvider =  new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(getUserDetailsService());

        authProvider.setPasswordEncoder(getPasswordEncoder());

        return authProvider;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/user/**").hasRole("USER")
                        .requestMatchers("/**").permitAll()

                )

                .formLogin(form -> form

                        .loginPage("/auth/signin")
                        .loginProcessingUrl("/login")
                        .defaultSuccessUrl("/user/")
                        .permitAll()

                )

                .logout(logout -> logout

                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/auth/signin?logout")
                        .permitAll()

                )

                .csrf(csrf -> csrf.disable());

        return http.build();
    }
}