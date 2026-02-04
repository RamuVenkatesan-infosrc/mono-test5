package com.banking.api.controller;

import com.banking.api.dto.TransactionRequest;
import com.banking.api.dto.TransactionResponse;
import com.banking.core.domain.Money;
import com.banking.transaction.domain.Transaction;
import com.banking.transaction.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/deposit")
    public ResponseEntity<TransactionResponse> deposit(@RequestBody TransactionRequest request) {
        Transaction transaction = transactionService.deposit(
            request.getAccountId(),
            new Money(request.getAmount(), request.getCurrency()),
            request.getDescription()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(transaction));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<TransactionResponse> withdraw(@RequestBody TransactionRequest request) {
        Transaction transaction = transactionService.withdraw(
            request.getAccountId(),
            new Money(request.getAmount(), request.getCurrency()),
            request.getDescription()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(transaction));
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(@RequestBody TransactionRequest request) {
        Transaction transaction = transactionService.transfer(
            request.getFromAccountId(),
            request.getToAccountId(),
            new Money(request.getAmount(), request.getCurrency()),
            request.getDescription()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(transaction));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionResponse>> getTransactionsByAccount(@PathVariable String accountId) {
        List<Transaction> transactions = transactionService.getTransactionsByAccount(accountId);
        List<TransactionResponse> responses = transactions.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionResponse> getTransaction(@PathVariable String transactionId) {
        Transaction transaction = transactionService.getTransaction(transactionId);
        return ResponseEntity.ok(toResponse(transaction));
    }

    private TransactionResponse toResponse(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setTransactionId(transaction.getTransactionId());
        response.setAccountId(transaction.getAccountId());
        response.setType(transaction.getType().name());
        response.setAmount(transaction.getAmount().getAmount().doubleValue());
        response.setCurrency(transaction.getAmount().getCurrency());
        response.setTimestamp(transaction.getTimestamp().toString());
        response.setDescription(transaction.getDescription());
        response.setRelatedAccountId(transaction.getRelatedAccountId());
        return response;
    }
}


package com.banking.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(getTrustedOrigins())
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(getTrustedOrigins());
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-CSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private List<String> getTrustedOrigins() {
        return Arrays.asList("http://localhost:3000", "https://yourbankingapp.com");
    }
}

package com.banking.api.config;

import com.banking.account.service.AccountService;
import com.banking.transaction.service.TransactionService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.servlet.http.HttpServletRequest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Arrays;
import java.util.List;

@Configuration
public class ServiceConfig {

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder();

    @Bean
    public AccountService accountService() {
        return new AccountService();
    }

    @Bean
    public TransactionService transactionService(AccountService accountService) {
        return new TransactionService(accountService);
    }

    public String generateCsrfToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return base64Encoder.encodeToString(randomBytes);
    }

    public boolean validateCsrfToken(HttpServletRequest request, String sessionToken) {
        String requestToken = request.getHeader("X-CSRF-TOKEN");
        return requestToken != null && requestToken.equals(sessionToken);
    }

    public List<String> getTrustedOrigins() {
        return Arrays.asList("http://localhost:3000", "https://yourbankingapp.com");
    }
}


package com.banking.api.config;

import com.banking.account.service.AccountService;
import com.banking.transaction.service.TransactionService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;
import java.util.Arrays;

@Configuration
public class ServiceConfig {

    @Bean
    public AccountService accountService() {
        return new AccountService();
    }

    @Bean
    public TransactionService transactionService(AccountService accountService) {
        return new TransactionService(accountService);
    }

    @Bean
    public List<String> trustedOrigins() {
        return Arrays.asList("https://trusted-frontend.com", "https://admin.trusted-frontend.com");
    }
}