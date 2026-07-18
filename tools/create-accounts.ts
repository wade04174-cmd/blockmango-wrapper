import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";
import { BlockmanGOClient, CaptchaError } from "../src";

const ACCOUNTS_FILE = path.join(__dirname, "accounts.json");

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

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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

async function createAccounts() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n=== BlockmanGO Account Creator ===\n");

  const name = await ask(rl, "Base name (e.g., WZRD): ");
  const count = parseInt(await ask(rl, "Number of accounts (e.g., 10): "), 10);
  const playerId = parseInt(await ask(rl, "Player ID to friend & like: "), 10);

  if (!name || isNaN(count) || isNaN(playerId)) {
    console.log("Invalid input.");
    rl.close();
    return;
  }

  console.log(`\nCreating ${count} accounts: ${name}1 to ${name}${count}`);
  console.log(`Target player: ${playerId}\n`);

  const data = loadAccounts();
  data.targetPlayerId = playerId;

  const existingNames = new Set(data.accounts.map((a) => a.username));
  let created = 0;
  let failed = 0;
  let captchaCount = 0;

  for (let i = 1; i <= count; i++) {
    const username = `${name}${i}`;
    const password = generatePassword();

    if (existingNames.has(username)) {
      console.log(`[${i}/${count}] ${username} - already exists, skipping`);
      continue;
    }

    console.log(`[${i}/${count}] Creating ${username}...`);

    try {
      const result = await BlockmanGOClient.register(username, password);
      console.log(`  OK - userId: ${result.userId}`);

      // Wait a moment then try to login to get a token
      await sleep(1000);

      try {
        const login = await BlockmanGOClient.login(username, password);
        data.accounts.push({
          username,
          password,
          userId: result.userId,
          accessToken: login.accessToken,
          deviceId: "E0-8F-4C-8D-E2-1C",
          created: new Date().toISOString(),
        });
        console.log(`  Logged in - token obtained`);
      } catch (loginErr) {
        // Registration succeeded but login failed (e.g., CAPTCHA)
        data.accounts.push({
          username,
          password,
          userId: result.userId,
          accessToken: "",
          deviceId: "E0-8F-4C-8D-E2-1C",
          created: new Date().toISOString(),
        });
        console.log(`  Registered but no token yet (will need manual login)`);
      }

      created++;
      saveAccounts(data);
    } catch (err) {
      if (err instanceof CaptchaError) {
        console.log(`  CAPTCHA required - stopping. ${created} accounts created.`);
        captchaCount++;
        break;
      }
      console.log(`  Failed: ${(err as Error).message}`);
      failed++;
    }

    // Rate limit protection
    if (i < count) await sleep(2000);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Created: ${created}`);
  console.log(`Failed: ${failed}`);
  console.log(`CAPTCHAs hit: ${captchaCount}`);
  console.log(`Total accounts: ${data.accounts.length}`);
  console.log(`Saved to: ${ACCOUNTS_FILE}`);

  // Ask about friend requests
  const answer = await ask(rl, "\nFriend requests accepted? (y/n): ");
  if (answer.toLowerCase() === "y") {
    console.log("\nSending popularity from all accounts...\n");
    await sendPopularity(data);
  }

  rl.close();
}

async function sendPopularity(data: AccountsData) {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < data.accounts.length; i++) {
    const acc = data.accounts[i];
    if (!acc.accessToken) {
      console.log(`[${i + 1}/${data.accounts.length}] ${acc.username} - no token, skipping`);
      failed++;
      continue;
    }

    console.log(`[${i + 1}/${data.accounts.length}] ${acc.username}...`);

    try {
      const client = new BlockmanGOClient({
        userId: acc.userId,
        accessToken: acc.accessToken,
        deviceId: acc.deviceId,
      });
      await client.addPopularity(data.targetPlayerId);
      console.log(`  OK`);
      success++;
    } catch (err) {
      console.log(`  Failed: ${(err as Error).message}`);
      failed++;
    }

    if (i < data.accounts.length - 1) await sleep(500);
  }

  console.log(`\nPopularity sent: ${success} success, ${failed} failed`);
}

createAccounts().catch(console.error);
