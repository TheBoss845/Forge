import { chromium } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));

// 1. Landing page should show guest CTA (Supabase not configured).
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
const heroCta = await page
  .getByRole("link", { name: "Try Forge now" })
  .first()
  .isVisible();
console.log("landing guest CTA visible:", heroCta);

// 2. Guest start form.
await page.goto("http://localhost:3000/try", { waitUntil: "networkidle" });
await page.fill("#businessName", "Northside Vet Clinic");
await page.selectOption("#industry", "Veterinary");
await page.fill(
  "#description",
  "A family-run veterinary clinic with two vets serving our neighborhood.",
);
await page.fill(
  "#biggestProblem",
  "All bookings happen by phone and the front desk is drowning in calls.",
);
await page.fill(
  "#prompt",
  "I need customers to book appointments online and staff to see the schedule.",
);
await page.screenshot({ path: "/tmp/forge-shots/guest-1-form.png" });
await page.getByRole("button", { name: "Start the interview" }).click();

// 3. Wait for the opening AI question.
await page.waitForSelector("text=who will use this system", { timeout: 15000 });
await page.screenshot({ path: "/tmp/forge-shots/guest-2-interview.png" });
console.log("opening question received");

// 4. Answer via suggested chip.
await page.getByRole("button", { name: "Customers and staff" }).click();
await page.waitForTimeout(1500);

// 5. Type an answer.
await page.fill("#guest-input", "We also want email reminders for customers.");
await page.getByRole("button", { name: "Send answer" }).click();
await page.waitForSelector("text=generate your blueprint", { timeout: 15000 });
console.log("discovery complete message received");

// 6. Generate blueprint.
await page.getByRole("button", { name: /Generate my blueprint/ }).click();
await page.waitForSelector("text=Guest Vet Booking", { timeout: 30000 });
await page.screenshot({
  path: "/tmp/forge-shots/guest-3-blueprint.png",
  fullPage: true,
});
console.log("blueprint rendered");

// 7. Download the code ZIP.
const downloadPromise = page.waitForEvent("download", { timeout: 20000 });
await page.getByRole("button", { name: "Download the code" }).click();
const download = await downloadPromise;
const path = await download.path();
console.log("download received:", download.suggestedFilename(), Boolean(path));

// 8. Reload — state should persist from localStorage.
await page.reload({ waitUntil: "networkidle" });
const persisted = await page.getByText("Guest Vet Booking").first().isVisible();
console.log("state persisted after reload:", persisted);

// 9. Back to the project list: the project shows as a card.
await page.getByRole("button", { name: "Back to projects" }).click();
await page.waitForSelector("text=Your projects", { timeout: 10000 });
const badge = await page.getByText("Blueprint ready").first().isVisible();
const newProject = await page
  .getByRole("button", { name: "New project" })
  .isVisible();
console.log("project list:", badge, "| new project button:", newProject);
await page.screenshot({ path: "/tmp/forge-shots/guest-4-projects.png" });

// 10. Reopen the project from the list.
await page.getByRole("button", { name: "Open" }).first().click();
await page.waitForSelector("text=Guest Vet Booking", { timeout: 10000 });
console.log("project reopened from list");

// 11. Login page should offer the device workspace, not a dead form.
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
const localMode = await page.getByText("No sign-in needed here").isVisible();
console.log("login page shows device-workspace doorway:", localMode);
await page.screenshot({ path: "/tmp/forge-shots/guest-5-login.png" });

console.log("page errors:", errors.length === 0 ? "none" : errors);
await browser.close();
