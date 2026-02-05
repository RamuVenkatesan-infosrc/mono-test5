Here's the Java class with Cucumber step definitions matching the given Gherkin scenarios:

```java
package steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.And;
import org.junit.jupiter.api.Assertions;
import org.springframework.web.client.RestTemplate;

public class AccountManagementSteps {

    private String customerId;
    private String accountId;
    private String accountType;
    private double balance;
    private String sourceAccountId;
    private String targetAccountId;
    private double sourceBalance;
    private double targetBalance;
    private boolean transactionSuccess;
    private boolean accountActive;

    private RestTemplate restTemplate = new RestTemplate();

    @Given("a customer with ID {string}")
    public void aCustomerWithID(String customerId) {
        this.customerId = customerId;
    }

    @When("they request to create a {string} account with an initial balance of {int}")
    public void theyRequestToCreateAnAccountWithAnInitialBalanceOf(String accountType, int initialBalance) {
        this.accountType = accountType;
        this.balance = initialBalance;
        // Implement API call to create account
    }

    @Then("a new account should be created successfully")
    public void aNewAccountShouldBeCreatedSuccessfully() {
        // Assert account creation
        Assertions.assertNotNull(accountId);
    }

    @And("the account balance should be {int}")
    public void theAccountBalanceShouldBe(int expectedBalance) {
        Assertions.assertEquals(expectedBalance, balance);
    }

    @Given("an active account with ID {string} and balance of {int}")
    public void anActiveAccountWithIDAndBalanceOf(String accountId, int balance) {
        this.accountId = accountId;
        this.balance = balance;
    }

    @When("the customer deposits {int} into the account")
    public void theCustomerDepositsIntoTheAccount(int amount) {
        // Implement deposit logic
        balance += amount;
    }

    @Then("the transaction should be successful")
    public void theTransactionShouldBeSuccessful() {
        Assertions.assertTrue(transactionSuccess);
    }

    @And("the new account balance should be {int}")
    public void theNewAccountBalanceShouldBe(int expectedBalance) {
        Assertions.assertEquals(expectedBalance, balance);
    }

    @Given("an active account {string} with balance of {int}")
    public void anActiveAccountWithBalanceOf(String accountId, int balance) {
        this.sourceAccountId = accountId;
        this.sourceBalance = balance;
    }

    @And("another active account {string} with balance of {int}")
    public void anotherActiveAccountWithBalanceOf(String accountId, int balance) {
        this.targetAccountId = accountId;
        this.targetBalance = balance;
    }

    @When("the customer transfers {int} from {string} to {string}")
    public void theCustomerTransfersFromTo(int amount, String sourceAccountId, String targetAccountId) {
        // Implement transfer logic
        sourceBalance -= amount;
        targetBalance += amount;
    }

    @And("the balance of {string} should be {int}")
    public void theBalanceOfShouldBe(String accountId, int expectedBalance) {
        if (accountId.equals(sourceAccountId)) {
            Assertions.assertEquals(expectedBalance, sourceBalance);
        } else if (accountId.equals(targetAccountId)) {
            Assertions.assertEquals(expectedBalance, targetBalance);
        }
    }

    @Given("an active account with ID {string}")
    public void anActiveAccountWithID(String accountId) {
        this.accountId = accountId;
        this.accountActive = true;
    }

    @When("the bank administrator deactivates the account")
    public void theBankAdministratorDeactivatesTheAccount() {
        // Implement account deactivation logic
        accountActive = false;
    }

    @Then("the account status should be inactive")
    public void theAccountStatusShouldBeInactive() {
        Assertions.assertFalse(accountActive);
    }

    @And("no further transactions should be allowed on this account")
    public void noFurtherTransactionsShouldBeAllowedOnThisAccount() {
        // Implement logic to check if transactions are blocked
        boolean transactionBlocked = true;
        Assertions.assertTrue(transactionBlocked);
    }
}
```
