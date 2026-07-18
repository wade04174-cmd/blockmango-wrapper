# API Reference

## Authentication

```
POST /user/api/v4/account/login
POST /user/api/v4/account/register
GET  /user/api/v5/account/auth-token
```

### Login

```typescript
const { accessToken, userId } = await BlockmanGOClient.login(username, password, deviceId?);
```

Password is RSA-encrypted (1024-bit PKCS1v1.5). Returns access token and numeric user ID.

Token-based login: pass JWT as password, numeric user ID as username, and deviceId.

### Register

```typescript
const result = await BlockmanGOClient.register(username, password);
```

Server requires CAPTCHA. Will return code 140 without valid CAPTCHA token.

## User

```
GET  /user/api/v1/user/info
GET  /user/api/v3/user/details/info
PUT  /user/api/v1/user/info
PUT  /user/api/v3/user/nickName
GET  /user/api/v1/users/bg-careers
GET  /user/api/v1/user/shop/info
GET  /user/api/v1/vip/users/{userId}
GET  /user/api/v1/user/avatar/frame
GET  /user/api/v1/user/language
GET  /user/api/v5/account/auth-token
POST /user/api/v1/file
```

| Method | Returns |
|--------|---------|
| `getUserInfo()` | `UserProfile` |
| `getUserDetails()` | `UserProfile` |
| `updateUserInfo(data)` | void |
| `changeNickname(name, oldName?)` | void |
| `getUserCareer(userId?)` | `UserCareer` |
| `getUserShopInfo()` | `UserShopInfo` |
| `getVipInfo(userId?)` | `UserVip` |
| `getAvatarFrames()` | `AvatarFrame[]` |
| `setLanguage(lang)` | void |
| `getAuthToken()` | `AuthTokenResponse` |
| `setAvatar(url)` | void |
| `uploadFile(path, name, type)` | string (URL) |

## Friends

```
GET    /friend/api/v3/friends
GET    /friend/api/v2/friends/status
GET    /friend/api/v3/friends/{userId}
GET    /friend/api/v1/friends/{userId}/gaming
POST   /friend/api/v1/friends
DELETE /friend/api/v1/friends/black
PUT    /friend/api/v1/friends/{id}/agreement
PUT    /friend/api/v1/friends/{id}/rejection
POST   /friend/api/v1/friends/{id}/alias
POST   /friend/api/v1/popularity
GET    /friend/api/v1/popularity/{userId}
GET    /friend/api/v1/friends/apply/num
GET    /friend/api/v1/friends/notice-list
```

| Method | Returns |
|--------|---------|
| `getFriends(page?, size?)` | `FriendUser[]` |
| `getAllFriendsStatus()` | `FriendStatusResponse` |
| `getFriendStatus(id)` | `FriendUser` |
| `getFriendGamingStatus(id)` | `{ gameId, regionId } \| null` |
| `sendFriendRequest(id, msg?)` | void |
| `deleteFriend(id)` | void |
| `blacklistFriend(id)` | void |
| `approveFriendRequest(id)` | void |
| `rejectFriendRequest(id)` | void |
| `setFriendAlias(id, alias)` | void |
| `addPopularity(id)` | void |
| `getPopularity(id?)` | `Popularity` |
| `getFriendRequestCount()` | number |
| `getFriendNotifications(page?, size?)` | unknown[] |

## Family

```
POST   /friend/api/v1/family/apply
GET    /friend/api/v1/family/recruit
POST   /friend/api/v1/family/recruit
DELETE /friend/api/v1/family/recruit
```

| Method | Returns |
|--------|---------|
| `applyToFamily(ownerId, age?, msg?)` | void |
| `getFamilyRecruitList()` | `FamilyRecruit[]` |
| `publishFamilyRecruit(age?, msg?)` | void |
| `deleteFamilyRecruit(age?, msg?)` | void |

## Clan

```
GET  /clan/api/v3/clan/tribe
GET  /clan/api/v1/clan/tribe/base
GET  /clan/api/v2/clan/tribe?clanId={id}
PUT  /clan/api/v1/clan/tribe
GET  /clan/api/v1/clan/tribe/recommendation
GET  /clan/api/v1/clan/tribe/blurry/info
GET  /clan/api/v1/clan/rank
```

| Method | Returns |
|--------|---------|
| `getMyClan()` | `ClanInfo` |
| `getMyClanBase()` | `ClanInfo` |
| `getClanInfo(id)` | `ClanInfo` |
| `updateClan(data)` | void |
| `getRecommendedClans()` | `ClanInfo[]` |
| `searchClans(query, page?, size?)` | `ClanInfo[]` |
| `getClanRank(page?, size?)` | `ClanRankResponse` |

## Clan Tasks

```
GET /clan/api/v3/clan/tasks
GET /clan/api/v3/clan/personal/tasks
PUT /clan/api/v1/clan/tasks/accept
PUT /clan/api/v1/clan/tasks
```

| Method | Returns |
|--------|---------|
| `getClanTasks(type?)` | `ClanTask[]` |
| `getPersonalClanTasks()` | `ClanTask[]` |
| `getClanTaskSummary()` | `{ total, available, inProgress, claimable, totalReward, totalRewards, tasks }` |
| `acceptClanTask(id, isTeam?)` | void |
| `claimClanTask(id, isTeam?)` | unknown |
| `claimAllClanTasks()` | `{ accepted, claimed, errors }` |
| `claimSpecificTasks(ids[])` | `{ claimed, errors }` |
| `acceptSpecificTasks(ids[])` | `{ accepted, errors }` |

Task statuses: 0 = available, 1 = in progress, 2 = claimable.

## Game

```
GET  /game/api/v3/games/{gameId}
GET  /game/api/v2/game/revision/all/list/by/condition/combine
GET  /game/api/v4/gameroom/list
GET  /game/api/v3/game/auth
GET  /game/api/v1/games/all/open/party
GET  /game/api/v1/backpack/mining-token/balance/with-transform
GET  /game/api/v1/ping/server/list
GET  /game/api/v1/gameroom/creative/list
GET  /game/api/v1/gameroom/recent/played
GET  /game/api/v1/gameroom/recent/created
```

| Method | Returns |
|--------|---------|
| `getGameInfo(id)` | `GameMetadata` |
| `getGameCatalog(page?, size?)` | unknown[] |
| `getGameRooms(mode?, page?, size?)` | `GameRoom[]` |
| `getGameAuth(gameId, version?)` | `GameAuthResponse` |
| `getPartyEnabledGames()` | `PartyGame[]` |
| `getMiningBalance()` | `MiningTokenBalance` |
| `getPingServers()` | `PingServer[]` |
| `getCreativeRooms(page?, size?)` | unknown[] |
| `getRecentlyPlayedRooms()` | unknown[] |
| `getRecentlyCreatedRooms()` | unknown[] |

Room modes: `""` (all), `"PVP"`, `"RUN"`, `"CREATE"`, `"SOCIAL"`, `"GAME"`, `"MINING"`.

## Shop

```
GET  /shop/api/v1/new/shop/decorations/classify/{category}
GET  /shop/api/v1/new/shop/recommend-decorations
GET  /shop/api/v1/new/shop/suit/decorations
GET  /shop/api/v2/shop/game/props/new
PUT  /shop/api/v2/shop/game/props/new
PUT  /game/api/v1/game/{gameId}/turntable
GET  /pay/api/v1/wealth/user
GET  /pay/api/v1/red-point
```

| Method | Returns |
|--------|---------|
| `getShopDecorations(category)` | `ShopDecoration[]` |
| `getRecommendedDecorations(type?)` | `ShopDecoration[]` |
| `getSuitDecorations()` | `ShopSuit[]` |
| `getGameShop(gameId)` | `ShopDecoration[]` |
| `buyGameProps(gameId, propsId)` | void |
| `claimGameReward(gameId)` | number |
| `getWealth()` | `Wealth` |
| `getPaymentRedPoints()` | `PaymentRedPoints` |

Decoration categories: `toufa` (hair), `shangyi` (top), `kuzi` (pants), `xie` (shoes), `liantiyi` (suit), etc.

## Decorations

```
GET    /decoration/api/v1/decorations/using
PUT    /decoration/api/v1/decorations/using/new
DELETE /decoration/api/v1/decorations/using/new
GET    /decoration/api/v1/redpoints
```

| Method | Returns |
|--------|---------|
| `getEquippedDecorations(userId?)` | `EquippedDecoration[]` |
| `equipDecoration(id)` | void |
| `unequipDecoration(id)` | void |
| `getDecorationRedPoints()` | `DecorationRedPoints` |

## Backpack

```
GET /backpack/api/v2/backpack/{userId}
```

| Method | Returns |
|--------|---------|
| `getBackpack(userId?)` | `BackpackItem[]` |
| `getTicketCount(userId?)` | number |

## Mail

```
GET  /mailbox/api/v1/mail/new
GET  /mailbox/api/v1/mail
PUT  /mailbox/api/v1/mail
GET  /msg/api/v1/user-notification/unread
GET  /msg/api/v1/msg/group/chat/list
```

| Method | Returns |
|--------|---------|
| `checkNewMail()` | boolean |
| `getMailList()` | unknown[] |
| `markMailRead(id)` | void |
| `getUnreadNotifications()` | unknown |
| `getGroupChatList(page?, size?)` | unknown[] |

## Config

```
GET /server-time
GET /config/files/blockymods-check-version
GET /activity/api/v1/activity/home/page
GET /activity/api/v2/theme
```

| Method | Returns |
|--------|---------|
| `getServerTime()` | number |
| `checkVersion()` | unknown |
| `getActivityHome()` | unknown |
| `getThemeInfo()` | unknown |
