# Examples

## Login

```typescript
import { BlockmanGOClient } from "blockmango-wrapper";

// Username/password
const { accessToken, userId } = await BlockmanGOClient.login("user", "pass");

// Token-based (user ID must be numeric)
const { accessToken, userId } = await BlockmanGOClient.login("12345678", "eyJ...", "device-id");

// Create client
const client = new BlockmanGOClient({
  userId,
  accessToken,
  deviceId: "optional-device-id",
  language: "en_US",
});
```

## Multi-Account Clan Task Claim

```typescript
const accounts = [
  { username: "user1", password: "pass1" },
  { username: "user2", password: "pass2" },
];

for (const acc of accounts) {
  const { accessToken, userId } = await BlockmanGOClient.login(acc.username, acc.password);
  const client = new BlockmanGOClient({ userId, accessToken });

  const summary = await client.getClanTaskSummary();
  console.log(`${acc.username}: ${summary.claimable} claimable, ${summary.totalReward} reward`);

  const result = await client.claimAllClanTasks();
  console.log(`  Accepted: ${result.accepted}, Claimed: ${result.claimed}`);
}
```

## Selective Task Claim

```typescript
import { claimAllAccounts, selectiveClaim } from "blockmango-wrapper/examples/clan-task-claim";

// Claim only high-reward tasks
await selectiveClaim(accounts, (task) => task.reward >= 100);

// Claim tasks for a specific game
await selectiveClaim(accounts, (task) => task.gameId === "g1008");
```

## User Profile

```typescript
const user = await client.getUserDetails();
console.log(`${user.nickName} - VIP ${user.vipLevel}`);
console.log(`Diamonds: ${user.diamonds}, Gold: ${user.golds}`);

const career = await client.getUserCareer();
console.log(`Kills: ${career.killCount}, Win rate: ${(career.victoryRate * 100).toFixed(1)}%`);
```

## Friends

```typescript
const friends = await client.getFriends();
for (const f of friends) {
  const status = f.status === 30 ? "Online" : "Offline";
  console.log(`${f.nickName} - ${status}`);
}

// Check if someone is in a game
const gaming = await client.getFriendGamingStatus(12345);
if (gaming) console.log(`Playing ${gaming.gameId}`);
```

## Game Rooms

```typescript
const pvpRooms = await client.getGameRooms("PVP");
for (const room of pvpRooms) {
  console.log(`${room.name} - ${room.curUsers}/${room.maxUsers} (${room.gameAddr})`);
}
```

## Shop

```typescript
const hats = await client.getShopDecorations("toufa");
for (const hat of hats) {
  console.log(`${hat.name} - ${hat.price} diamonds`);
}

await client.buyGameProps("g1008", 1234);
```

## Avatar Upload

```typescript
const url = await client.uploadFile("./photo.jpg", "avatar", "jpg");
await client.setAvatar(url);
```

## Error Handling

```typescript
try {
  await client.getUserInfo();
} catch (error) {
  // HTTP errors:    "HTTP 401: Unauthorized"
  // API errors:     "API Error 4001: token expired"
  console.error(error.message);
}
```

## Low-Level Signing

```typescript
import { signRequest } from "blockmango-wrapper";

const headers = signRequest({
  path: "/user/api/v1/user/info",
  params: {},
  body: "",
  deviceId: "your-device-id",
});
// { "x-apikey": "...", "x-nonce": "...", "x-time": "...", "x-sign": "...", "x-urlpath": "..." }
```
