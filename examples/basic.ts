import { BlockmanGOClient } from "../src";

async function main() {
  // Login
  const { accessToken, userId } = await BlockmanGOClient.login(
    "your_username",
    "your_password"
  );

  const client = new BlockmanGOClient({ userId, accessToken });

  // User info
  const user = await client.getUserDetails();
  console.log(`Welcome, ${user.nickName}! (ID: ${user.userId})`);
  console.log(`VIP Level: ${user.vipLevel}`);
  console.log(`Diamonds: ${user.diamonds}`);
  console.log(`Gold: ${user.golds}`);

  // Friends
  const friends = await client.getFriends();
  console.log(`\nFriends: ${friends.length}`);
  for (const f of friends.slice(0, 5)) {
    const status = f.status === 30 ? "Online" : "Offline";
    console.log(`  ${f.nickName} — ${status}`);
  }

  // Game rooms
  const rooms = await client.getGameRooms("PVP", 0, 5);
  console.log(`\nPVP Rooms: ${rooms.length}`);
  for (const room of rooms) {
    console.log(
      `  ${room.name} — ${room.curUsers}/${room.maxUsers} (${room.gameName})`
    );
  }

  // Wealth
  const wealth = await client.getWealth();
  console.log(`\nWealth:`);
  console.log(`  Diamonds: ${wealth.diamonds}`);
  console.log(`  Gold: ${wealth.golds}`);

  // Decorations
  const equipped = await client.getEquippedDecorations();
  console.log(`\nEquipped decorations: ${equipped.length}`);

  // Shop
  const hats = await client.getShopDecorations("toufa");
  console.log(`\nAvailable hats: ${hats.length}`);

  // Clan
  try {
    const clan = await client.getMyClan();
    console.log(`\nClan: ${clan.name} (Level ${clan.level})`);
    console.log(`Members: ${clan.currentCount}/${clan.maxCount}`);
  } catch {
    console.log("\nNot in a clan");
  }

  // Backpack tickets
  const tickets = await client.getTicketCount();
  console.log(`\nTickets: ${tickets}`);

  // Server time
  const time = await client.getServerTime();
  console.log(`\nServer time: ${new Date(time * 1000).toISOString()}`);
}

main().catch(console.error);
