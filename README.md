# blockmango-wrapper

[![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?logo=discord&logoColor=white)](https://discord.gg/bVgjq6)
[![npm](https://img.shields.io/npm/v/blockmango-wrapper)](https://www.npmjs.com/package/blockmango-wrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Unofficial BlockmanGO API wrapper for Node.js/TypeScript. Author: Mitsumi.

## Install

```
npm install blockmango-wrapper
```

## Usage

```typescript
import { BlockmanGOClient } from "blockmango-wrapper";

const { accessToken, userId } = await BlockmanGOClient.login("user", "pass");
const client = new BlockmanGOClient({ userId, accessToken });

const user = await client.getUserDetails();
console.log(user.nickName);
```

## API

All methods return promises. Errors throw as `Error` with descriptive messages.

**Auth**
- `BlockmanGOClient.login(user, pass, deviceId?)` - login, returns `{ accessToken, userId }`
- `BlockmanGOClient.register(user, pass)` - register (server requires CAPTCHA)
- `new BlockmanGOClient({ userId, accessToken, deviceId?, language? })`

**User**
- `getUserInfo()`, `getUserDetails()`, `updateUserInfo(data)`
- `changeNickname(name)`, `setAvatar(url)`, `uploadFile(path, name, type)`
- `getUserCareer(userId?)`, `getUserShopInfo()`, `getVipInfo(userId?)`
- `getAvatarFrames()`, `getAuthToken()`, `setLanguage(lang)`

**Friends**
- `getFriends()`, `getAllFriendsStatus()`, `getFriendStatus(id)`
- `getFriendGamingStatus(id)` - returns `{ gameId, regionId }` or null
- `sendFriendRequest(id, msg?)`, `deleteFriend(id)`, `blacklistFriend(id)`
- `approveFriendRequest(id)`, `rejectFriendRequest(id)`
- `setFriendAlias(id, alias)`, `addPopularity(id)`, `getPopularity(id?)`
- `getFriendRequestCount()`, `getFriendNotifications()`

**Family**
- `applyToFamily(ownerId, age?, msg?)`
- `getFamilyRecruitList()`, `publishFamilyRecruit(age?, msg?)`
- `deleteFamilyRecruit(age?, msg?)`

**Clan**
- `getMyClan()`, `getMyClanBase()`, `getClanInfo(id)`
- `updateClan({ name, details, headPic, tags? })`
- `searchClans(query)`, `getRecommendedClans()`, `getClanRank()`

**Clan Tasks**
- `getClanTasks(type?)` - returns `ClanTask[]`
- `getPersonalClanTasks()`, `getClanTaskSummary()`
- `acceptClanTask(id, isTeam?)`, `claimClanTask(id, isTeam?)`
- `claimAllClanTasks()` - batch claim, returns `{ accepted, claimed, errors }`
- `claimSpecificTasks(ids[])`, `acceptSpecificTasks(ids[])`

**Game**
- `getGameInfo(id)`, `getGameCatalog()`, `getGameRooms(mode?)`
- `getGameAuth(gameId, version?)` - JWT for game sessions
- `getPartyEnabledGames()`, `getMiningBalance()`, `getPingServers()`
- `getCreativeRooms()`, `getRecentlyPlayedRooms()`, `getRecentlyCreatedRooms()`

**Shop**
- `getShopDecorations(category)`, `getRecommendedDecorations(type?)`
- `getSuitDecorations()`, `getGameShop(gameId)`
- `buyGameProps(gameId, propsId)`, `claimGameReward(gameId)`
- `getWealth()`, `getPaymentRedPoints()`

**Decorations**
- `getEquippedDecorations(userId?)`, `equipDecoration(id)`
- `unequipDecoration(id)`, `getDecorationRedPoints()`

**Backpack**
- `getBackpack(userId?)`, `getTicketCount(userId?)`

**Mail**
- `checkNewMail()`, `getMailList()`, `markMailRead(id)`
- `getUnreadNotifications()`, `getGroupChatList()`

**Config**
- `getServerTime()`, `checkVersion()`, `getActivityHome()`, `getThemeInfo()`

## Clan Task Example

```typescript
const summary = await client.getClanTaskSummary();
// { total: 5, available: 2, inProgress: 1, claimable: 2, totalReward: 500 }

const result = await client.claimAllClanTasks();
// { accepted: 2, claimed: 2, errors: [] }
```

See [docs/examples.md](docs/examples.md) for multi-account auto-claim.

## Docs

- [API Reference](docs/api.md) - full endpoint documentation
- [Examples](docs/examples.md) - code samples
- [Authentication](docs/authentication.md) - signing algorithm details

## Requirements

Node.js >= 18.0.0 (uses native `fetch`)

## License

MIT
