// Use relative path when served from same origin, or absolute for standalone
const API_BASE_URL = window.location.origin + '/api';

// Global state
let allAccounts = [];
let currentTransactionTab = 'deposit';
let confirmCallback = null;

// Sanitization function using DOMPurify
function sanitizeHTML(str) {
    return DOMPurify.sanitize(str, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'], ALLOWED_ATTR: ['href'] });
}

// Theme management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.querySelector('.theme-toggle i');
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Tab management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        const tabs = ['dashboard', 'accounts', 'transactions', 'transfer'];
        if (tabs[index] === tabName) {
            item.classList.add('active');
        }
    });

    // Load data when switching tabs
    if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'accounts') {
        loadAccounts();
    }
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    toastIcon.className = `toast-icon fas ${icons[type]}`;
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

function hideToast() {
    document.getElementById('toast').classList.remove('show');
}

// Loading overlay
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

// Confirmation modal
function showConfirmModal(title, message, callback) {
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    if (confirmTitle && confirmMessage) {
        confirmTitle.textContent = sanitizeHTML(title);
        confirmMessage.textContent = sanitizeHTML(message);
        document.getElementById('confirmModal').classList.add('show');
        confirmCallback = callback;
    }
}

function hideConfirmModal() {
    document.getElementById('confirmModal').classList.remove('show');
    confirmCallback = null;
}

function confirmAction() {
    if (confirmCallback) {
        confirmCallback();
    }
    hideConfirmModal();
}

// API Helper
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorText;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        return await response.json();
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
        throw error;
    }
}

// Format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format account ID (short version)
function formatAccountId(accountId) {
    return accountId ? `${accountId.substring(0, 4)}-${accountId.substring(4, 8)}-${accountId.substring(8, 12)}-${accountId.substring(12, 16)}` : '';
}

// Populate account dropdowns
function populateAccountDropdowns() {
    const selects = ['depositAccountId', 'withdrawAccountId', 'fromAccountId', 'toAccountId', 'historyAccountId'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select account</option>';
            allAccounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.accountId;
                option.textContent = `${formatAccountId(account.accountId)} - ${sanitizeHTML(account.accountType)} (${formatCurrency(account.balance, account.currency)})`;
                if (account.accountId === currentValue) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }
    });
}

// Load Dashboard
async function loadDashboard() {
    try {
        showLoading();
        const accounts = await apiCall('/accounts');
        allAccounts = accounts;
        
        // Calculate stats
        const totalAccounts = accounts.length;
        const activeAccounts = accounts.filter(acc => acc.active).length;
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        
        // Update header stats
        const headerTotalBalance = document.getElementById('headerTotalBalance');
        const headerAccountCount = document.getElementById('headerAccountCount');
        if (headerTotalBalance) headerTotalBalance.textContent = formatCurrency(totalBalance);
        if (headerAccountCount) headerAccountCount.textContent = totalAccounts.toString();
        
        // Update dashboard stats
        const totalAccountsElement = document.getElementById('totalAccounts');
        const activeAccountsElement = document.getElementById('activeAccounts');
        const totalBalanceElement = document.getElementById('totalBalance');
        const totalTransactionsElement = document.getElementById('totalTransactions');
        
        if (totalAccountsElement) totalAccountsElement.textContent = totalAccounts.toString();
        if (activeAccountsElement) activeAccountsElement.textContent = activeAccounts.toString();
        if (totalBalanceElement) totalBalanceElement.textContent = formatCurrency(totalBalance);
        if (totalTransactionsElement) totalTransactionsElement.textContent = 'N/A'; // Could be calculated if needed
        
        // Display recent accounts
        const dashboardAccounts = document.getElementById('dashboardAccounts');
        if (dashboardAccounts) {
            if (accounts.length === 0) {
                dashboardAccounts.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-wallet"></i>
                        <p>No accounts found. Create your first account to get started.</p>
                    </div>
                `;
            } else {
                dashboardAccounts.innerHTML = accounts.slice(0, 4).map(account => `
                    <div class="account-card">
                        <div class="account-header">
                            <span class="account-type">${sanitizeHTML(account.accountType)}</span>
                            <span class="account-status ${account.active ? 'active' : 'inactive'}">
                                ${account.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div class="account-balance">
                            <div class="account-balance-label">Available Balance</div>
                            <div class="account-balance-amount">${formatCurrency(account.balance, account.currency)}</div>
                        </div>
                        <div class="account-id">
                            <strong>Account:</strong> ${formatAccountId(account.accountId)}
                        </div>
                    </div>
                `).join('');
            }
        }
        
        // Load recent activity (placeholder for now)
        const recentActivity = document.getElementById('recentActivity');
        if (recentActivity) {
            recentActivity.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <p>No recent activity</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    } finally {
        hideLoading();
    }
}

// Account Management
const createAccountForm = document.getElementById('createAccountForm');
if (createAccountForm) {
    createAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            showLoading();
            const account = await apiCall('/accounts', 'POST', {
                customerId: document.getElementById('customerId').value,
                accountType: document.getElementById('accountType').value,
                initialBalance: parseFloat(document.getElementById('initialBalance').value),
                currency: document.getElementById('currency').value
            });
            showToast(`Account created successfully! Account: ${formatAccountId(account.accountId)}`, 'success');
            createAccountForm.reset();
            await loadAccounts();
            await loadDashboard();
        } catch (error) {
            // Error already shown by apiCall
        } finally {
            hideLoading();
        }
    });
}

async function loadAccounts() {
    try {
        showLoading();
        const accounts = await apiCall('/accounts');
        allAccounts = accounts;
        populateAccountDropdowns();
        
        const accountsList = document.getElementById('accountsList');
        if (accountsList) {
            if (accounts.length === 0) {
                accountsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-wallet"></i>
                        <p>No accounts found. Create your first account to get started.</p>
                    </div>
                `;
                return;
            }
            
            displayFilteredAccounts(accounts);
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
    } finally {
        hideLoading();
    }
}

const customerAccountsForm = document.getElementById('customerAccountsForm');
if (customerAccountsForm) {
    customerAccountsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const customerId = document.getElementById('customerIdSearch').value;
            const accounts = await apiCall(`/accounts/customer/${customerId}`);
            const customerAccountsList = document.getElementById('customerAccountsList');
            if (customerAccountsList) {
                if (accounts.length === 0) {
                    customerAccountsList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-search"></i>
                            <p>No accounts found for customer ${sanitizeHTML(customerId)}.</p>
                        </div>
                    `;
                    return;
                }
                customerAccountsList.innerHTML = accounts.map(account => `
                    <div class="account-card">
                        <div class="account-header">
                            <span class="account-type">${sanitizeHTML(account.accountType)}</span>
                            <span class="account-status ${account.active ? 'active' : 'inactive'}">
                                ${account.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div class="account-balance">
                            <div class="account-balance-label">Available Balance</div>
                            <div class="account-balance-amount">${formatCurrency(account.balance, account.currency)}</div>
                        </div>
                        <div class="account-id">
                            <strong>Account:</strong> ${formatAccountId(account.accountId)}
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            // Error already shown by apiCall
        }
    });
}

// Transaction Management
const depositForm = document.getElementById('depositForm');
if (depositForm) {
    depositForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            showLoading();
            const accountId = document.getElementById('depositAccountId').value;
            const account = allAccounts.find(acc => acc.accountId === accountId);
            const currency = account ? account.currency : 'USD';
            
            const transaction = await apiCall('/transactions/deposit', 'POST', {
                accountId: accountId,
                amount: parseFloat(document.getElementById('depositAmount').value),
                currency: currency,
                description: sanitizeHTML(document.getElementById('depositDescription').value)
            });
            showToast(`Deposit successful! Amount: ${formatCurrency(transaction.amount, transaction.currency)}`, 'success');
            depositForm.reset();
            await loadAccounts();
            await loadDashboard();
        } catch (error) {
            // Error already shown by apiCall
        } finally {
            hideLoading();
        }
    });
}

const withdrawForm = document.getElementById('withdrawForm');
if (withdrawForm) {
    withdrawForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            showLoading();
            const accountId = document.getElementById('withdrawAccountId').value;
            const account = allAccounts.find(acc => acc.accountId === accountId);
            const currency = account ? account.currency : 'USD';
            
            const transaction = await apiCall('/transactions/withdraw', 'POST', {
                accountId: accountId,
                amount: parseFloat(document.getElementById('withdrawAmount').value),
                currency: currency,
                description: sanitizeHTML(document.getElementById('withdrawDescription').value)
            });
            showToast(`Withdrawal successful! Amount: ${formatCurrency(transaction.amount, transaction.currency)}`, 'success');
            withdrawForm.reset();
            await loadAccounts();
            await loadDashboard();
        } catch (error) {
            // Error already shown by apiCall
        } finally {
            hideLoading();
        }
    });
}

const transferForm = document.getElementById('transferForm');
if (transferForm) {
    transferForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateTransferForm()) {
            return;
        }
        
        const fromAccountId = document.getElementById('fromAccountId').value;
        const toAccountId = document.getElementById('toAccountId').value;
        const amount = parseFloat(document.getElementById('transferAmount').value);
        const description = sanitizeHTML(document.getElementById('transferDescription').value);
        
        showConfirmModal(
            'Confirm Transfer',
            `Transfer ${formatCurrency(amount)} from


package com.banking.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
@EnableWebSecurity
public class WebConfig extends WebSecurityConfigurerAdapter implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()  // Disable CSRF protection as per project constraints
            .authorizeRequests()
                .antMatchers("/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .httpBasic()
            .and()
            .headers()
                .contentSecurityPolicy("default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'")
                .and()
            .frameOptions()
                .deny();
    }
}

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
import org.owasp.encoder.Encode;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "https://trusted-origin.com")
public class TransactionController {

    private final TransactionService transactionService;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/deposit")
    public ResponseEntity<TransactionResponse> deposit(@RequestBody TransactionRequest request) {
        validateTransactionRequest(request);
        Transaction transaction = transactionService.deposit(
            request.getAccountId(),
            new Money(request.getAmount(), request.getCurrency()),
            Encode.forHtml(request.getDescription())
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(transaction));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<TransactionResponse> withdraw(@RequestBody TransactionRequest request) {
        validateTransactionRequest(request);
        Transaction transaction = transactionService.withdraw(
            request.getAccountId(),
            new Money(request.getAmount(), request.getCurrency()),
            Encode.forHtml(request.getDescription())
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(transaction));
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(@RequestBody TransactionRequest request) {
        validateTransactionRequest(request);
        Transaction transaction = transactionService.transfer(
            request.getFromAccountId(),
            request.getToAccountId(),
            new Money(request.getAmount(), request.getCurrency()),
            Encode.forHtml(request.getDescription())
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
        response.setDescription(Encode.forHtml(transaction.getDescription()));
        response.setRelatedAccountId(transaction.getRelatedAccountId());
        return response;
    }

    private void validateTransactionRequest(TransactionRequest request) {
        if (request.getAmount() <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (request.getDescription() != null && request.getDescription().length() > 255) {
            throw new IllegalArgumentException("Description must not exceed 255 characters");
        }
    }
}

package com.banking.api.config;

import com.banking.account.service.AccountService;
import com.banking.transaction.service.TransactionService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
}