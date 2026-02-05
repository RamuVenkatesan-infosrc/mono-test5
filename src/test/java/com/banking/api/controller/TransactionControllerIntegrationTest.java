Here's the JUnit 5 test class for the TransactionController:

```java
package com.banking.api.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TransactionController.class)
public class TransactionControllerApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetAccount() throws Exception {
        mockMvc.perform(get("/account/{accountId}", 1L))
               .andExpect(status().isOk());
    }

    @Test
    public void testGetTransaction() throws Exception {
        mockMvc.perform(get("/{transactionId}", 1L))
               .andExpect(status().isOk());
    }

    @Test
    public void testDeposit() throws Exception {
        String depositJson = "{\"accountId\":1,\"amount\":100.00}";
        mockMvc.perform(post("/deposit")
               .contentType(MediaType.APPLICATION_JSON)
               .content(depositJson))
               .andExpect(status().isOk());
    }

    @Test
    public void testWithdraw() throws Exception {
        String withdrawJson = "{\"accountId\":1,\"amount\":50.00}";
        mockMvc.perform(post("/withdraw")
               .contentType(MediaType.APPLICATION_JSON)
               .content(withdrawJson))
               .andExpect(status().isOk());
    }

    @Test
    public void testTransfer() throws Exception {
        String transferJson = "{\"fromAccountId\":1,\"toAccountId\":2,\"amount\":75.00}";
        mockMvc.perform(post("/transfer")
               .contentType(MediaType.APPLICATION_JSON)
               .content(transferJson))
               .andExpect(status().isOk());
    }
}
```
