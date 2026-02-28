
import asyncio
from playwright.async_api import async_playwright, expect

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Navigate to the app
        await page.goto("http://localhost:3000")

        # Switch to Solver Mode
        await page.get_by_role("button", name="Solver Mode").click()

        # Check for the input with the new aria-label
        input_field = page.get_by_label("Equation to solve")
        await expect(input_field).to_be_visible()

        # Focus the Solve button to check focus styles
        solve_button = page.get_by_role("button", name="Solve", exact=True)
        await solve_button.focus()

        # Take a screenshot
        await page.screenshot(path="verification/solver_accessibility.png")

        print("Verification successful!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
