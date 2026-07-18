import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import * as open from "open";
import { signRequest, encryptPassword } from "../src/auth";

const ACCOUNTS_FILE = path.join(__dirname, "accounts.json");
const BASE_NAME = "IHateRishu";
const COUNT = 101;
const TARGET_PLAYER_ID = 45890736;

interface Account {
  username: string;
  password: string;
  userId: number;
  accessToken: string;
  deviceId: string;
  created: string;
}

interface AccountsData {
  targetPlayerId: number;
  accounts: Account[];
}

function loadAccounts(): AccountsData {
  try {
    return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf8"));
  } catch {
    return { targetPlayerId: 0, accounts: [] };
  }
}

function saveAccounts(data: AccountsData) {
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(data, null, 2));
}

function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pass = "A";
  for (let i = 0; i < 7; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function fetchDevice(): Promise<[string, string]> {
  const resp = await fetch("https://pastebin.com/raw/m4EZm0z5", {
    headers: { "User-Agent": "vse.taki.wizard", "Host": "pastebin.com" },
  });
  const text = await resp.text();
  const pattern = /\{"device":\s*"([^"]+)",\s*"signature":\s*"([^"]+)"\}/g;
  const devices: [string, string][] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) devices.push([match[1], match[2]]);
  return devices[Math.floor(Math.random() * devices.length)];
}

async function registerWithCaptcha(username: string, password: string, rl: readline.Interface): Promise<{ userId: number; accessToken: string } | null> {
  const [device, sig] = await fetchDevice();
  const encrypted = encryptPassword(password);

  const body = {
    account: username,
    code: "",
    confirmPassword: encrypted,
    email: "",
    password: encrypted,
    userId: 0,
  };
  const bodyStr = JSON.stringify(body);
  const signed = signRequest({ path: "/user/api/v4/account/register", body: bodyStr });

  const resp = await fetch("https://gw.sandboxol.com/user/api/v4/account/register", {
    method: "POST",
    headers: {
      Host: "gw.sandboxol.com",
      "bmg-device-id": device,
      "bmg-sign": sig,
      os: "android",
      "content-type": "application/json; charset=UTF-8",
      "user-agent": "okhttp/4.12.0",
      ...signed,
    },
    body: bodyStr,
  });

  const data = await resp.json();

  if (data.code === 1) {
    return { userId: data.data.userId, accessToken: data.data.accessToken || "" };
  }

  if (data.code === 140) {
    console.log(`  CAPTCHA required. Opening browser...`);

    // Create HTML page with CAPTCHA instructions
    const html = `<!DOCTYPE html>
<html>
<head><title>CAPTCHA - ${username}</title>
<style>
  body { font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center; }
  h1 { color: #333; }
  .info { background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
  .ticket { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; word-break: break-all; }
  input { width: 100%; padding: 10px; font-size: 16px; margin: 10px 0; box-sizing: border-box; }
  button { padding: 10px 30px; font-size: 16px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 5px; }
  button:hover { background: #45a049; }
</style>
</head>
<body>
  <h1>CAPTCHA Required</h1>
  <div class="info">
    <p>Account: <strong>${username}</strong></p>
    <p>The BlockmanGO app requires a CAPTCHA to create this account.</p>
    <p>You need to solve a CAPTCHA in the BlockmanGO app or website, then paste the ticket below.</p>
  </div>
  <h3>How to get the ticket:</h3>
  <ol style="text-align: left;">
    <li>Open BlockmanGO on your phone</li>
    <li>Try to create an account with: <strong>${username}</strong> / <strong>${password}</strong></li>
    <li>When CAPTCHA appears, solve it</li>
    <li>The CAPTCHA will return a ticket string</li>
    <li>Paste it below and click Submit</li>
  </ol>
  <input type="text" id="ticket" placeholder="Paste CAPTCHA ticket here">
  <button onclick="submitTicket()">Submit</button>
  <div id="status"></div>
  <script>
    function submitTicket() {
      const ticket = document.getElementById('ticket').value;
      if (!ticket) { alert('Please enter a ticket'); return; }
      document.getElementById('status').innerHTML = '<p>Ticket submitted: ' + ticket + '</p>';
      // Send ticket to file
      fetch('/ticket', { method: 'POST', body: ticket });
    }
  </script>
</body>
</html>`;

    const htmlPath = path.join(__dirname, "captcha.html");
    fs.writeFileSync(htmlPath, html);

    // Also create a simple file-based ticket system
    const ticketFile = path.join(__dirname, "captcha_ticket.txt");
    if (fs.existsSync(ticketFile)) fs.unlinkSync(ticketFile);

    console.log(`  Open this file in your browser: ${htmlPath}`);
    console.log(`  OR solve CAPTCHA in BlockmanGO app and paste the ticket here.`);

    // Try to open browser
    try {
      await open(htmlPath);
    } catch {}

    // Wait for ticket
    const ticket = await ask(rl, `  Paste CAPTCHA ticket: `);

    if (!ticket.trim()) {
      console.log(`  No ticket provided, skipping.`);
      return null;
    }

    // Retry with ticket
    const bodyWithTicket = {
      ...body,
      code: ticket.trim(),
    };
    const bodyStr2 = JSON.stringify(bodyWithTicket);
    const signed2 = signRequest({ path: "/user/api/v4/account/register", body: bodyStr2 });

    const resp2 = await fetch("https://gw.sandboxol.com/user/api/v4/account/register", {
      method: "POST",
      headers: {
        Host: "gw.sandboxol.com",
        "bmg-device-id": device,
        "bmg-sign": sig,
        os: "android",
        "content-type": "application/json; charset=UTF-8",
        "user-agent": "okhttp/4.12.0",
        ...signed2,
      },
      body: bodyStr2,
    });

    const data2 = await resp2.json();
    if (data2.code === 1) {
      return { userId: data2.data.userId, accessToken: data2.data.accessToken || "" };
    }

    console.log(`  Still failed: ${data2.message}`);
    return null;
  }

  console.log(`  Failed: ${data.message}`);
  return null;
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n=== BlockmanGO Account Creator (with CAPTCHA) ===\n");
  console.log(`Name: ${BASE_NAME}000 to ${BASE_NAME}100`);
  console.log(`Target: ${TARGET_PLAYER_ID}\n`);

  const data = loadAccounts();
  data.targetPlayerId = TARGET_PLAYER_ID;

  const existingNames = new Set(data.accounts.map((a) => a.username));
  let created = 0;
  let failed = 0;

  for (let i = 0; i < COUNT; i++) {
    const username = `${BASE_NAME}${i.toString().padStart(3, "0")}`;
    const password = generatePassword();

    if (existingNames.has(username)) {
      console.log(`[${i + 1}/${COUNT}] ${username} - exists, skip`);
      continue;
    }

    console.log(`[${i + 1}/${COUNT}] ${username}...`);

    const result = await registerWithCaptcha(username, password, rl);

    if (result) {
      console.log(`  OK - userId: ${result.userId}`);

      // Try to login
      try {
        const { BlockmanGOClient } = await import("../src");
        const login = await BlockmanGOClient.login(username, password);
        data.accounts.push({
          username,
          password,
          userId: result.userId,
          accessToken: login.accessToken,
          deviceId: "E0-8F-4C-8D-E2-1C",
          created: new Date().toISOString(),
        });
        console.log(`  Logged in`);
      } catch {
        data.accounts.push({
          username,
          password,
          userId: result.userId,
          accessToken: "",
          deviceId: "E0-8F-4C-8D-E2-1C",
          created: new Date().toISOString(),
        });
        console.log(`  No token yet`);
      }

      created++;
      saveAccounts(data);
    } else {
      failed++;
    }

    if (i < COUNT - 1) await sleep(2000);
  }

  console.log(`\n=== Done ===`);
  console.log(`Created: ${created}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${data.accounts.length}`);
  console.log(`Saved to: ${ACCOUNTS_FILE}`);

  rl.close();
}

main().catch(console.error);
