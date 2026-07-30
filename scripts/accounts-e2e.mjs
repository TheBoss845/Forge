// End-to-end test of Forge's built-in accounts (KV-backed, no database):
// register → workspace sync → sign out → sign in from a "second device".
import { chromium } from "playwright";

const browser = await chromium.launch();
const errors = [];

const email = `owner${Date.now()}@example.com`;
const password = "super-secret-123";

// --- Device 1: register and create a project ---
const deviceOne = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await deviceOne.newPage();
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
console.log(
  "landing shows Sign in (accounts available):",
  await page.getByRole("link", { name: "Sign in" }).first().isVisible(),
);

await page.goto("http://localhost:3000/register", { waitUntil: "networkidle" });
await page.fill("#fullName", "Taylor Owner");
await page.fill("#email", email);
await page.fill("#password", password);
await page.getByRole("button", { name: "Create account" }).click();
await page.waitForURL("**/try", { timeout: 15000 });
await page.waitForSelector(`text=Signed in as`, { timeout: 10000 });
console.log("registered and signed in, landed on workspace");

// Create a project.
await page.fill("#businessName", "Sunrise Bakery");
await page.selectOption("#industry", "Restaurants & food");
await page.fill(
  "#description",
  "A neighborhood bakery with a loyal morning crowd.",
);
await page.fill(
  "#biggestProblem",
  "Phone orders for custom cakes get lost on paper notes.",
);
await page.fill(
  "#prompt",
  "I need a system to take custom cake orders online and track them to pickup.",
);
await page.getByRole("button", { name: "Start the interview" }).click();
await page.waitForSelector("text=who will use this system", { timeout: 15000 });
console.log("project created, interview started");
await page.waitForTimeout(1500); // allow debounced sync PUT

// Sign out.
await page
  .getByRole("button", { name: "Back to projects" })
  .click()
  .catch(() => {});
await page.goto("http://localhost:3000/try", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Sign out" }).click();
await page.waitForSelector("text=Saved on this device", { timeout: 10000 });
console.log("signed out cleanly");

// Wrong password is rejected.
await page.waitForTimeout(800);
await page.goto("http://localhost:3000/login", {
  waitUntil: "domcontentloaded",
});
await page.waitForSelector("#email", { timeout: 10000 });
await page.fill("#email", email);
await page.fill("#password", "wrong-password");
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForSelector("text=Incorrect email or password", {
  timeout: 10000,
});
console.log("wrong password rejected");
await deviceOne.close();

// --- Device 2: fresh browser, sign in, expect the synced project ---
const deviceTwo = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page2 = await deviceTwo.newPage();
page2.on("pageerror", (e) => errors.push(String(e)));

await page2.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await page2.fill("#email", email);
await page2.fill("#password", password);
await page2.getByRole("button", { name: "Sign in" }).click();
await page2.waitForURL("**/try", { timeout: 15000 });
await page2.waitForSelector("text=Signed in as", { timeout: 10000 });
await page2.waitForSelector("text=Sunrise Bakery", { timeout: 10000 });
console.log("SECOND DEVICE sees the synced project: true");
await page2.screenshot({ path: "/tmp/forge-shots/accounts-sync.png" });
await deviceTwo.close();

console.log("page errors:", errors.length === 0 ? "none" : errors);
await browser.close();
