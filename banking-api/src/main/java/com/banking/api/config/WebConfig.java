package com.banking.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
// @EnableWebSecurity
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }

    // @Override
    // protected void configure(HttpSecurity http) throws Exception {
    //     http
    //         .csrf().disable()  // Disable CSRF protection as per project constraints
    //         .authorizeRequests()
    //             .antMatchers("/**").permitAll()
    //             .anyRequest().authenticated()
    //         .and()
    //         .httpBasic();
    // }
}