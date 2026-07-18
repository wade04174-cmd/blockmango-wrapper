import { BlockmanGOClient } from "../src";
import type { ClanTaskSummary } from "../src";

interface Account {
  username: string;
  password: string;
}

function printTasks(tasks: ClanTaskSummary[]) {
  for (const task of tasks) {
    const icon =
      task.status === "claimable" ? "[*]" :
      task.status === "available" ? "[ ]" : "[~]";

    let line = `    ${icon} #${task.id} ${task.name}`;
    if (task.reward > 0) line += ` (${task.reward} tokens)`;

    console.log(line);

    // Show all reward types (clan tokens, alliance donations, etc.)
    if (task.rewards && task.rewards.length > 0) {
      const rewardStr = task.rewards
        .map((r) => `${r.amount} ${r.type}`)
        .join(", ");
      console.log(`        Rewards: ${rewardStr}`);
    }

    if (task.description) {
      console.log(`        ${task.description}`);
    }

    if (task.progress !== undefined && task.target !== undefined) {
      console.log(`        Progress: ${task.progress}/${task.target}`);
    }

    if (task.gameId) {
      console.log(`        Game: ${task.gameId}`);
    }
  }
}

async function claimAllAccounts(accounts: Account[]) {
  console.log(`\n=== Clan Task Auto-Claim ===`);
  console.log(`Accounts: ${accounts.length}\n`);

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    console.log(`[${i + 1}/${accounts.length}] ${acc.username}`);

    try {
      const { accessToken, userId } = await BlockmanGOClient.login(
        acc.username,
        acc.password
      );

      const client = new BlockmanGOClient({ userId, accessToken });
      const summary = await client.getClanTaskSummary();

      console.log(`  Tasks: ${summary.total} total`);
      console.log(`    Available: ${summary.available}`);
      console.log(`    In Progress: ${summary.inProgress}`);
      console.log(`    Claimable: ${summary.claimable}`);
      console.log(`    Total Reward: ${summary.totalReward} tokens`);

      // Show reward breakdown by type
      if (summary.totalRewards.length > 0) {
        const byType = new Map<string, number>();
        for (const r of summary.totalRewards) {
          byType.set(r.type, (byType.get(r.type) || 0) + r.amount);
        }
        console.log(`    Reward Breakdown:`);
        for (const [type, amount] of byType) {
          console.log(`      ${type}: ${amount}`);
        }
      }

      console.log(`\n  All Tasks:`);
      printTasks(summary.tasks);

      const result = await client.claimAllClanTasks();
      console.log(`\n  Result: +${result.accepted} accepted, +${result.claimed} claimed`);
      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.join(", ")}`);
      }
    } catch (e) {
      console.log(`  Error: ${(e as Error).message}`);
    }

    console.log();
  }
}

async function selectiveClaim(
  accounts: Account[],
  taskFilter: (task: ClanTaskSummary) => boolean
) {
  console.log(`\n=== Selective Clan Task Claim ===\n`);

  for (const acc of accounts) {
    console.log(`Account: ${acc.username}`);

    try {
      const { accessToken, userId } = await BlockmanGOClient.login(
        acc.username,
        acc.password
      );
      const client = new BlockmanGOClient({ userId, accessToken });

      const tasks = await client.listClanTasks();
      const matching = tasks.filter(taskFilter);

      console.log(`  Matching tasks: ${matching.length}`);
      printTasks(matching);

      const claimable = matching.filter((t) => t.status === "claimable");
      const available = matching.filter((t) => t.status === "available");

      if (available.length > 0) {
        const r = await client.acceptSpecificTasks(available.map((t) => t.id));
        console.log(`  Accepted: ${r.accepted}`);
      }
      if (claimable.length > 0) {
        const r = await client.claimSpecificTasks(claimable.map((t) => t.id));
        console.log(`  Claimed: ${r.claimed}`);
      }
    } catch (e) {
      console.log(`  Error: ${(e as Error).message}`);
    }
    console.log();
  }
}

export { claimAllAccounts, selectiveClaim, printTasks };
