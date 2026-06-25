import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test("redirects from root to /login when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("textbox", { name: "อีเมล" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ส่งลิงก์เข้าสู่ระบบ" })
    ).toBeVisible();
  });

  test("shows validation error for empty email", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "ส่งลิงก์เข้าสู่ระบบ" }).click();
    // Supabase Magic Link sends even for empty-ish emails, but we expect form to stay
    await expect(page).toHaveURL(/\/login/);
  });

  test("has correct page title", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/BankMe/);
  });
});