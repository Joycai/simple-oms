import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test("login page renders with all elements", async ({ page }) => {
  await page.goto(BASE + "/login");

  // Page title
  await expect(page).toHaveTitle("simple-oms");

  // Form elements
  await expect(page.getByPlaceholder(/用户名/)).toBeVisible();
  await expect(page.getByPlaceholder(/密码/)).toBeVisible();
  await expect(page.getByRole("button", { name: /登.*录/ })).toBeVisible();
  await expect(page.getByText("忘记密码")).toBeVisible();

  // Language switcher
  await expect(page.getByText("English")).toBeVisible();
});

test("login with wrong password shows error", async ({ page }) => {
  await page.goto(BASE + "/login");

  await page.getByPlaceholder(/用户名/).fill("admin");
  await page.getByPlaceholder(/密码/).fill("wrong");
  await page.getByRole("button", { name: /登.*录/ }).click();

  // Should show error toast/message
  await expect(page.getByText(/用户名或密码错误/)).toBeVisible({ timeout: 5000 });
});

test("login success redirects to dashboard", async ({ page }) => {
  await page.goto(BASE + "/login");

  await page.getByPlaceholder(/用户名/).fill("admin");
  await page.getByPlaceholder(/密码/).fill("admin123");
  await page.getByRole("button", { name: /登.*录/ }).click();

  // Should redirect to dashboard
  await page.waitForURL("**/dashboard", { timeout: 5000 });
  await expect(page.getByText(/欢迎/)).toBeVisible();
});

test("unauthenticated access redirects to login", async ({ page }) => {
  await page.goto(BASE + "/dashboard");
  await page.waitForURL("**/login", { timeout: 5000 });
});

test("i18n switches to English", async ({ page }) => {
  await page.goto(BASE + "/login");

  // Switch to English
  await page.getByText("English").click();

  // Form should now be in English
  await expect(page.getByPlaceholder(/username/i)).toBeVisible();
});
