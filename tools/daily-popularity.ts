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

function loadAccounts(): AccountsData | null {
  try {
    return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf8"));
  } catch {
    return null;
  }
}

function saveAccounts(data: AccountsData) {
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(data, null, 2));
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n=== BlockmanGO Daily Popularity ===\n");

  const data = loadAccounts();
  if (!data || data.accounts.length === 0) {
    console.log("No accounts found. Run create-accounts first.");
    rl.close();
    return;
  }

  console.log(`Found ${data.accounts.length} accounts`);
  console.log(`Target player: ${data.targetPlayerId}\n`);

  const overrideTarget = await ask(rl, `Target player ID (Enter to use ${data.targetPlayerId}): `);
  const targetId = overrideTarget ? parseInt(overrideTarget, 10) : data.targetPlayerId;

  if (isNaN(targetId)) {
    console.log("Invalid player ID.");
    rl.close();
    return;
  }

  console.log(`\nSending popularity to ${targetId}...\n`);

  let success = 0;
  let failed = 0;
  let noToken = 0;
  let captchaHit = false;

  for (let i = 0; i < data.accounts.length; i++) {
    const acc = data.accounts[i];

    if (!acc.accessToken) {
      console.log(`[${i + 1}/${data.accounts.length}] ${acc.username} - no token, trying login...`);

      try {
        const login = await BlockmanGOClient.login(acc.username, acc.password);
        acc.accessToken = login.accessToken;
        acc.userId = login.userId;
        saveAccounts(data);
        console.log(`  Login OK`);
      } catch (err) {
        if (err instanceof CaptchaError) {
          console.log(`  CAPTCHA - skipping remaining accounts`);
          captchaHit = true;
          break;
        }
        console.log(`  Login failed: ${(err as Error).message}`);
        noToken++;
        continue;
      }
    }

    console.log(`[${i + 1}/${data.accounts.length}] ${acc.username}...`);

    try {
      const client = new BlockmanGOClient({
        userId: acc.userId,
        accessToken: acc.accessToken,
        deviceId: acc.deviceId,
      });
      await client.addPopularity(targetId);
      console.log(`  OK`);
      success++;
    } catch (err) {
      if (err instanceof CaptchaError) {
        console.log(`  CAPTCHA - stopping`);
        captchaHit = true;
        break;
      }
      const msg = (err as Error).message;
      if (msg.includes("401") || msg.includes("token")) {
        console.log(`  Token expired, relogging...`);
        try {
          const login = await BlockmanGOClient.login(acc.username, acc.password);
          acc.accessToken = login.accessToken;
          acc.userId = login.userId;
          saveAccounts(data);
          const client = new BlockmanGOClient({
            userId: acc.userId,
            accessToken: login.accessToken,
            deviceId: acc.deviceId,
          });
          await client.addPopularity(targetId);
          console.log(`  OK (after relogin)`);
          success++;
        } catch {
          console.log(`  Failed even after relogin`);
          failed++;
        }
      } else {
        console.log(`  Failed: ${msg}`);
        failed++;
      }
    }

    if (i < data.accounts.length - 1) await sleep(500);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`No token: ${noToken}`);
  if (captchaHit) console.log(`CAPTCHA hit - try again later`);

  rl.close();
}

main().catch(console.error);
