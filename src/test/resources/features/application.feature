Feature: Account Management and Transactions

  Scenario: Create a new account
    Given a customer with ID "12345"
    When they request to create a "Savings" account with an initial balance of 1000
    Then a new account should be created successfully
    And the account balance should be 1000

  Scenario: Deposit money into an account
    Given an active account with ID "ACC001" and balance of 500
    When the customer deposits 200 into the account
    Then the transaction should be successful
    And the new account balance should be 700

  Scenario: Transfer money between accounts
    Given an active account "ACC001" with balance of 1000
    And another active account "ACC002" with balance of 500
    When the customer transfers 300 from "ACC001" to "ACC002"
    Then the transaction should be successful
    And the balance of "ACC001" should be 700
    And the balance of "ACC002" should be 800

  Scenario: Deactivate an account
    Given an active account with ID "ACC003"
    When the bank administrator deactivates the account
    Then the account status should be inactive
    And no further transactions should be allowed on this account
