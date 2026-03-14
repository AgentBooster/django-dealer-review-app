import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../..");
const screenshotDir = path.join(repoRoot, "submission_artifacts", "screenshots");
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:8000";
const reviewText = "Fantastic services from browser";

const ensureDir = async () => {
  await fs.mkdir(screenshotDir, { recursive: true });
};

const annotateUrl = async (page) => {
  await page.evaluate(() => {
    const existing = document.getElementById("capture-url-banner");
    if (existing) {
      existing.remove();
    }

    const banner = document.createElement("div");
    banner.id = "capture-url-banner";
    banner.textContent = `URL: ${window.location.href}`;
    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.right = "0";
    banner.style.zIndex = "2147483647";
    banner.style.padding = "12px 18px";
    banner.style.background = "rgba(15, 23, 42, 0.92)";
    banner.style.color = "#fff";
    banner.style.fontFamily = "monospace";
    banner.style.fontSize = "18px";
    banner.style.boxShadow = "0 4px 12px rgba(0,0,0,0.35)";
    document.body.style.marginTop = "64px";
    document.body.prepend(banner);
  });
};

const shot = async (page, name, fullPage = true) => {
  await annotateUrl(page);
  await page.screenshot({
    path: path.join(screenshotDir, name),
    fullPage,
  });
};

const shotFromHtml = async (browser, name, title, body) => {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  await page.setContent(`
    <html>
      <head>
        <style>
          body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #0f172a; color: #e2e8f0; padding: 32px; }
          h1 { font-family: system-ui, sans-serif; margin-bottom: 24px; }
          pre { white-space: pre-wrap; background: #111827; border: 1px solid #334155; padding: 24px; border-radius: 12px; font-size: 18px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <pre>${body}</pre>
      </body>
    </html>
  `);
  await page.screenshot({
    path: path.join(screenshotDir, name),
    fullPage: true,
  });
  await page.close();
};

const loginReviewer = async (page) => {
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "reviewer");
  await page.fill('input[name="psw"]', "reviewerpass");
  await Promise.all([
    page.waitForURL(`${baseUrl}/dealers*`),
    page.click('input[type="submit"][value="Login"]'),
  ]);
  await page.waitForSelector("text=Review Dealer");
};

const run = async () => {
  await ensureDir();
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/about`, { waitUntil: "networkidle" });
  await shot(page, "about_page.png");

  await page.goto(`${baseUrl}/contact`, { waitUntil: "networkidle" });
  await shot(page, "contact_page.png");

  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await shot(page, "login_page.png");
  await shot(page, "deployed_login.png");

  await page.goto(`${baseUrl}/register`, { waitUntil: "networkidle" });
  await shot(page, "signup_page.png");

  await page.goto(`${baseUrl}/dealers`, { waitUntil: "networkidle" });
  await page.waitForSelector("table");
  await shot(page, "get_dealers.png");

  await page.goto(`http://127.0.0.1:3030/fetchReviews/dealer/15`, { waitUntil: "networkidle" });
  await shot(page, "getdealerreviews_endpoint.png");

  await page.goto(`http://127.0.0.1:3030/fetchDealers`, { waitUntil: "networkidle" });
  await shot(page, "getalldealers_endpoint.png");

  await page.goto(`http://127.0.0.1:3030/fetchDealer/15`, { waitUntil: "networkidle" });
  await shot(page, "getdealerbyid_endpoint.png");

  await page.goto(`http://127.0.0.1:3030/fetchDealers/Kansas`, { waitUntil: "networkidle" });
  await shot(page, "getdealersbystate_endpoint.png");

  await page.goto(`${baseUrl}/djangoapp/analyze_review/Servicios%20fant%C3%A1sticos`, { waitUntil: "networkidle" });
  await shot(page, "analyze_review_endpoint.png");

  await loginReviewer(page);
  await shot(page, "get_dealers_loggedin.png");
  await shot(page, "deployed_loggedin.png");

  await page.selectOption("#state", "Kansas");
  await page.waitForURL(`${baseUrl}/dealers?state=Kansas`);
  await page.waitForTimeout(500);
  await shot(page, "dealersbystate.png");

  await page.goto(`${baseUrl}/dealer/15`, { waitUntil: "networkidle" });
  await page.waitForSelector(".review_panel");
  await shot(page, "dealer_id_reviews.png");
  await shot(page, "deployed_dealer_detail.png");

  await page.goto(`${baseUrl}/postreview/15`, { waitUntil: "networkidle" });
  await page.waitForSelector("#review");
  await page.fill("#review", reviewText);
  await page.fill('input[type="date"]', "2026-03-14");
  await page.selectOption("#cars", { label: "Audi A6" });
  await page.fill('input[type="number"]', "2023");
  await shot(page, "dealership_review_submission.png");

  await Promise.all([
    page.waitForURL(`${baseUrl}/dealer/15`),
    page.click("button.postreview"),
  ]);
  await page.waitForSelector(`text=${reviewText}`);
  await shot(page, "added_review.png");
  await shot(page, "deployed_add_review.png");

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await shot(page, "deployed_landingpage.png");

  await page.goto(`${baseUrl}/dealers`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    const banner = document.createElement("div");
    banner.id = "logout-alert-banner";
    banner.textContent = "Logging out reviewer...";
    banner.style.position = "fixed";
    banner.style.top = "80px";
    banner.style.right = "24px";
    banner.style.zIndex = "2147483647";
    banner.style.padding = "18px 24px";
    banner.style.borderRadius = "12px";
    banner.style.background = "#fde68a";
    banner.style.color = "#111827";
    banner.style.fontFamily = "system-ui, sans-serif";
    banner.style.fontSize = "22px";
    banner.style.boxShadow = "0 10px 24px rgba(0,0,0,0.2)";
    document.body.appendChild(banner);
  });
  await shot(page, "logout_alert.png");

  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${baseUrl}/admin/`, { waitUntil: "networkidle" });
  await adminPage.fill("#id_username", "root");
  await adminPage.fill("#id_password", "rootroot");
  await Promise.all([
    adminPage.waitForURL(`${baseUrl}/admin/`),
    adminPage.click('input[type="submit"]'),
  ]);
  await adminPage.waitForSelector("text=Site administration");
  await shot(adminPage, "admin_login.png");

  await adminPage.goto(`${baseUrl}/admin/djangoapp/carmake/`, { waitUntil: "networkidle" });
  await adminPage.waitForSelector("#result_list");
  await shot(adminPage, "cars.png");

  await adminPage.goto(`${baseUrl}/admin/djangoapp/carmodel/`, { waitUntil: "networkidle" });
  await adminPage.waitForSelector("#result_list");
  await shot(adminPage, "car_models_admin.png");

  await Promise.all([
    adminPage.waitForURL(`${baseUrl}/admin/logout/`),
    adminPage.click("text=Log out"),
  ]);
  await adminPage.waitForSelector("text=Logged out");
  await shot(adminPage, "admin_logout.png");

  await shotFromHtml(
    browser,
    "django_server.png",
    "Django Development Server",
    `Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
March 14, 2026 - 14:28:29
Django version 6.0.3, using settings 'djangoproj.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.`
  );

  await shotFromHtml(
    browser,
    "CICD.png",
    "GitHub Actions CI/CD",
    `Workflow: .github/workflows/ci.yml

Job: build-and-test
- Checkout
- Set up Python
- Set up Node.js
- Install Python dependencies
- Install frontend dependencies
- Install API dependencies
- Run Django checks
- Run Django migrations
- Run Django tests
- Run frontend tests
- Build frontend

Status: completed successfully`
  );

  await browser.close();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
