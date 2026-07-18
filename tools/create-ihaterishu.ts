import * as fs from "fs";
import * as path from "path";
import { BlockmanGOClient, CaptchaError } from "../src";

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

async function main() {
  console.log("\n=== BlockmanGO Account Creator ===\n");
  console.log(`Name: ${BASE_NAME}0 to ${BASE_NAME}${COUNT - 1}`);
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

    try {
      const result = await BlockmanGOClient.register(username, password);
      console.log(`  Registered - userId: ${result.userId}`);

      await sleep(1500);

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
        console.log(`  No token (need manual login)`);
      }

      created++;
      saveAccounts(data);
    } catch (err) {
      if (err instanceof CaptchaError) {
        console.log(`\n  CAPTCHA HIT - stopping at account ${i + 1}`);
        console.log(`  Created so far: ${created}`);
        console.log(`  Run again to continue from where we left off\n`);
        break;
      }
      console.log(`  Failed: ${(err as Error).message}`);
      failed++;
    }

    if (i < COUNT - 1) await sleep(3000);
  }

  console.log(`\n=== Done ===`);
  console.log(`Created: ${created}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total accounts: ${data.accounts.length}`);
  console.log(`Saved to: ${ACCOUNTS_FILE}`);
}

main().catch(console.error);
