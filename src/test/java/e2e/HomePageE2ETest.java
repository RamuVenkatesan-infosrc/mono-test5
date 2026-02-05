package e2e;

import com.microsoft.playwright.*;
import org.junit.jupiter.api.*;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class HomePageE2ETest {

    private static Playwright playwright;
    private static Browser browser;
    private BrowserContext context;
    private Page page;
    private static final String BASE_URL = System.getenv().getOrDefault("E2E_BASE_URL", "http://localhost:8080");

    @BeforeAll
    static void launchBrowser() {
        playwright = Playwright.create();
        browser = playwright.chromium().launch();
    }

    @AfterAll
    static void closeBrowser() {
        if (browser != null) {
            browser.close();
        }
        if (playwright != null) {
            playwright.close();
        }
    }

    @BeforeEach
    void createContextAndPage() {
        context = browser.newContext();
        page = context.newPage();
    }

    @AfterEach
    void closeContext() {
        if (context != null) {
            context.close();
        }
    }

    @Test
    void testHomePageLoads() {
        page.navigate(BASE_URL);
        assertThat(page.locator("h1")).isVisible();
        assertThat(page.locator("h1")).hasText("Welcome to Our Website");
    }

    @Test
    void testLoginForm() {
        page.navigate(BASE_URL + "/login");
        page.fill("#username", "testuser");
        page.fill("#password", "testpass");
        page.click("button[type=submit]");
        assertThat(page.locator(".welcome-message")).hasText("Welcome, testuser!");
    }
}
