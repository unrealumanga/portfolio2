const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

test("renders the full portfolio and opens project galleries", async ({ page }) => {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });

  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator(".project-card")).toHaveCount(24);
  await expect(page.locator(".index-button")).toHaveCount(36);

  await page.locator(".project-card").first().click();
  await expect(page.locator("#project-dialog")).toHaveAttribute("open", "");
  await expect(page.locator("#dialog-title")).toHaveText("Trojena Mobile Pavilion");
  await expect(page.locator(".gallery-item")).toHaveCount(5);

  await page.locator("#dialog-next").click();
  await expect(page.locator("#dialog-title")).toHaveText("Lana Experience Centre");
  await page.locator("#dialog-close").click();
  await expect(page.locator("#project-dialog")).not.toHaveAttribute("open", "");

  expect(runtimeErrors).toEqual([]);
});

test("mobile menu remains keyboard and touch accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });

  const menuButton = page.locator("#menu-button");
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#mobile-menu")).toBeVisible();

  await page.locator("#mobile-menu a[href='#work']").click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#mobile-menu")).toBeHidden();
});

test("has no automatically detectable accessibility violations", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
