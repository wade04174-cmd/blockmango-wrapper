import { signRequest, encryptPassword, md5 } from "./auth";
import * as fs from "fs";
import * as path from "path";
import type {
  APIResponse,
  UserProfile,
  FriendUser,
  FriendStatusResponse,
  UserCareer,
  UserShopInfo,
  UserVip,
  Popularity,
  Wealth,
  ShopDecoration,
  ShopSuit,
  EquippedDecoration,
  GameRoom,
  GameAuthResponse,
  GameMetadata,
  PartyGame,
  ClanInfo,
  ClanTask,
  ClanTaskSummary,
  ClanTaskReward,
  ClaimResult,
  AvatarFrame,
  PaymentRedPoints,
  DecorationRedPoints,
  AuthTokenResponse,
  MiningTokenBalance,
  PingServer,
  BackpackItem,
  ClanRankResponse,
  FamilyRecruit,
} from "./types";

const DEFAULT_HEADERS: Record<string, string> = {
  packagename: "blockymods",
  packagenamefull: "com.sandboxol.blockymods",
  appversion: "5671",
  appversionname: "3.21.1",
  androidversion: "36",
  channel: "sandbox",
  region: "sandbox",
  env: "prd",
  clienttype: "client",
  userlanguage: "en_US",
};

const DEFAULT_TIMEOUT = 15000;

export interface BlockmanGOClientOptions {
  userId: number;
  accessToken: string;
  deviceId?: string;
  deviceSignature?: string;
  language?: string;
}

export class BlockmanGOClient {
  private userId: number;
  private accessToken: string;
  private deviceId: string;
  private deviceSignature: string;
  private language: string;
  private baseUrl = "https://gw.sandboxol.com";

  constructor(options: BlockmanGOClientOptions) {
    this.userId = options.userId;
    this.accessToken = options.accessToken;
    this.deviceId = options.deviceId || "E0-8F-4C-8D-E2-1C";
    this.deviceSignature =
      options.deviceSignature || "xEGRkZHZJbCH+27N+LBJxktf57OrioeTvwcAUumrFhQ=";
    this.language = options.language || "en_US";
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    options: {
      params?: Record<string, string>;
      body?: unknown;
      extra?: Record<string, string>;
      auth?: boolean;
      host?: string;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const {
      params = {},
      body,
      extra = {},
      auth = true,
      host = this.baseUrl,
      timeout = DEFAULT_TIMEOUT,
    } = options;

    const bodyStr = body ? JSON.stringify(body) : undefined;
    const signed = signRequest({
      path,
      params,
      body: bodyStr || "",
      deviceId: auth ? this.deviceId : undefined,
    });

    const headers: Record<string, string> = {
      Host: host.replace("https://", "").replace("http://", ""),
      os: "android",
      "user-agent": "okhttp/4.12.0",
      ...DEFAULT_HEADERS,
      ...signed,
      ...extra,
    };

    if (auth) {
      headers["userid"] = this.userId.toString();
      headers["access-token"] = this.accessToken;
      headers["userdeviceid"] = this.deviceId;
    }

    if (bodyStr) {
      headers["content-type"] = "application/json; charset=UTF-8";
    }

    const queryString = Object.keys(params)
      .sort()
      .map((k) => `${k}=${encodeURIComponent(params[k])}`)
      .join("&");

    const url = `${host}${path}${queryString ? `?${queryString}` : ""}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: bodyStr,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
      }

      const data = (await response.json()) as APIResponse<T>;

      if (data.code !== 1) {
        throw new Error(`API Error ${data.code}: ${data.message}`);
      }

      return data.data;
    } catch (error) {
      clearTimeout(timer);
      throw error;
    }
  }

  // ─── Account ──────────────────────────────────────────────

  static async login(
    account: string,
    password: string,
    deviceId?: string
  ): Promise<{ accessToken: string; userId: number }> {
    const dev = deviceId || "E0-8F-4C-8D-E2-1C";
    const devSign = "xEGRkZHZJbCH+27N+LBJxktf57OrioeTvwcAUumrFhQ=";

    if (password.startsWith("eyJ")) {
      if (!/^\d+$/.test(account)) {
        throw new Error("Account must be numeric user ID for token login");
      }
      return {
        accessToken: password,
        userId: parseInt(account, 10),
      };
    }

    const encrypted = encryptPassword(password);
    const body = {
      account,
      password: encrypted,
      tsvAccount: "",
      tsvPlatform: "",
      tsvToken: "",
    };

    const bodyStr = JSON.stringify(body);
    const signed = signRequest({
      path: "/user/api/v4/account/login",
      body: bodyStr,
    });

    const headers: Record<string, string> = {
      Host: "gw.sandboxol.com",
      "bmg-device-id": dev,
      "bmg-sign": devSign,
      os: "android",
      apptype: "WZRD-TOOL",
      "content-type": "application/json; charset=UTF-8",
      "user-agent": "okhttp/4.12.0",
      ...DEFAULT_HEADERS,
      ...signed,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(
        "https://gw.sandboxol.com/user/api/v4/account/login",
        {
          method: "POST",
          headers,
          body: bodyStr,
          signal: controller.signal,
        }
      );

      clearTimeout(timer);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
      }

      const data = (await response.json()) as APIResponse<{
        accessToken: string;
        userId: number;
      }>;

      if (data.code !== 1) {
        throw new Error(`Login failed: ${data.message}`);
      }

      if (!data.data.accessToken) {
        throw new Error("2FA enabled — token is null");
      }

      return data.data;
    } catch (error) {
      clearTimeout(timer);
      throw error;
    }
  }

  static async register(
    username: string,
    password: string
  ): Promise<{ userId: number; accessToken: string; nickName: string }> {
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
    const signed = signRequest({
      path: "/user/api/v4/account/register",
      body: bodyStr,
    });

    const headers: Record<string, string> = {
      Host: "gw.sandboxol.com",
      "bmg-device-id": "E0-8F-4C-8D-E2-1C",
      "bmg-sign": "xEGRkZHZJbCH+27N+LBJxktf57OrioeTvwcAUumrFhQ=",
      os: "android",
      "content-type": "application/json; charset=UTF-8",
      "user-agent": "okhttp/4.12.0",
      ...DEFAULT_HEADERS,
      ...signed,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(
        "https://gw.sandboxol.com/user/api/v4/account/register",
        {
          method: "POST",
          headers,
          body: bodyStr,
          signal: controller.signal,
        }
      );

      clearTimeout(timer);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
      }

      const data = (await response.json()) as APIResponse<{
        userId: number;
        accessToken: string;
        nickName: string;
      }>;

      if (data.code !== 1) {
        throw new Error(`Registration failed: ${data.message}`);
      }

      return data.data;
    } catch (error) {
      clearTimeout(timer);
      throw error;
    }
  }

  // ─── User ─────────────────────────────────────────────────

  async getUserInfo(): Promise<UserProfile> {
    return this.request("GET", "/user/api/v1/user/info");
  }

  async getUserDetails(): Promise<UserProfile> {
    return this.request("GET", "/user/api/v3/user/details/info");
  }

  async updateUserInfo(data: Partial<UserProfile>): Promise<void> {
    await this.request("PUT", "/user/api/v1/user/info", { body: data });
  }

  async changeNickname(newName: string, oldName?: string): Promise<void> {
    const current = oldName || (await this.getUserInfo()).nickName;
    await this.request("PUT", "/user/api/v3/user/nickName", {
      params: { newName, oldName: current },
    });
  }

  async getUserCareer(userId?: number): Promise<UserCareer> {
    return this.request("GET", "/user/api/v1/users/bg-careers", {
      params: { userId: (userId || this.userId).toString() },
    });
  }

  async getUserShopInfo(): Promise<UserShopInfo> {
    return this.request("GET", "/user/api/v1/user/shop/info");
  }

  async getVipInfo(userId?: number): Promise<UserVip> {
    return this.request("GET", `/user/api/v1/vip/users/${userId || this.userId}`);
  }

  async getAvatarFrames(): Promise<AvatarFrame[]> {
    return this.request("GET", "/user/api/v1/user/avatar/frame");
  }

  async setLanguage(language: string): Promise<void> {
    this.language = language;
    await this.request("GET", "/user/api/v1/user/language", {
      params: { userId: this.userId.toString(), language },
    });
  }

  async getAuthToken(): Promise<AuthTokenResponse> {
    const q = Buffer.from(JSON.stringify({ userId: this.userId })).toString(
      "base64"
    );
    return this.request("GET", "/user/api/v5/account/auth-token", {
      params: { q },
    });
  }

  // ─── Friends ──────────────────────────────────────────────

  async getFriends(page = 0, pageSize = 500): Promise<FriendUser[]> {
    return this.request("GET", "/friend/api/v3/friends", {
      params: {
        pageNo: page.toString(),
        pageSize: pageSize.toString(),
        showBigParty: "1",
      },
    });
  }

  async getAllFriendsStatus(): Promise<FriendStatusResponse> {
    return this.request("GET", "/friend/api/v2/friends/status", {
      params: { showBigParty: "1" },
    });
  }

  async getFriendStatus(userId: number): Promise<FriendUser> {
    return this.request("GET", `/friend/api/v3/friends/${userId}`, {
      params: { showBigParty: "1" },
    });
  }

  async getFriendGamingStatus(
    userId: number
  ): Promise<{ gameId: string; regionId: number } | null> {
    try {
      const data = await this.request<{
        gameId: string;
        gamingInfo: { regionId: number };
      }>("GET", `/friend/api/v1/friends/${userId}/gaming`, {
        params: { showBigParty: "1", engine4Version: "40040" },
      });
      return {
        gameId: data.gameId,
        regionId: data.gamingInfo?.regionId ?? 0,
      };
    } catch {
      return null;
    }
  }

  async sendFriendRequest(
    friendId: number,
    message = "Hello!"
  ): Promise<void> {
    await this.request("POST", "/friend/api/v1/friends", {
      body: {
        channel: 7,
        friendId,
        gameId: "",
        msg: message,
        type: 1,
      },
    });
  }

  async blacklistFriend(friendId: number): Promise<void> {
    await this.request("DELETE", "/friend/api/v1/friends/black", {
      params: { friendId: friendId.toString() },
    });
  }

  async deleteFriend(friendId: number): Promise<void> {
    return this.blacklistFriend(friendId);
  }

  async approveFriendRequest(friendId: number): Promise<void> {
    await this.request("PUT", `/friend/api/v1/friends/${friendId}/agreement`);
  }

  async rejectFriendRequest(friendId: number): Promise<void> {
    await this.request("PUT", `/friend/api/v1/friends/${friendId}/rejection`);
  }

  async setFriendAlias(friendId: number, alias: string): Promise<void> {
    await this.request("POST", `/friend/api/v1/friends/${friendId}/alias`, {
      params: { alias },
    });
  }

  async getPopularity(userId?: number): Promise<Popularity> {
    return this.request(
      "GET",
      `/friend/api/v1/popularity/${userId || this.userId}`
    );
  }

  async addPopularity(userId: number): Promise<void> {
    await this.request("POST", "/friend/api/v1/popularity", {
      params: { friendId: userId.toString() },
    });
  }

  async getFriendRequestCount(): Promise<number> {
    return this.request("GET", "/friend/api/v1/friends/apply/num");
  }

  async getFriendNotifications(page = 0, pageSize = 10): Promise<unknown[]> {
    return this.request("GET", "/friend/api/v1/friends/notice-list", {
      params: { pageNo: page.toString(), pageSize: pageSize.toString() },
    });
  }

  // ─── Family ───────────────────────────────────────────────

  async applyToFamily(
    ownerId: number,
    age = 0,
    message = ""
  ): Promise<void> {
    await this.request("POST", "/friend/api/v1/family/apply", {
      body: { age, msg: message, ownerId, sex: 1, type: 1 },
    });
  }

  async getFamilyRecruitList(): Promise<FamilyRecruit[]> {
    return this.request("GET", "/friend/api/v1/family/recruit", {
      params: { type: "0" },
    });
  }

  async publishFamilyRecruit(
    age = 200,
    message = ""
  ): Promise<void> {
    const user = await this.getUserInfo();
    await this.request("POST", "/friend/api/v1/family/recruit", {
      body: {
        age,
        memberName: user.nickName,
        memberType: 2,
        msg: message,
        ownerName: user.nickName,
        ownerType: 2,
      },
      extra: { appversion: "1488", userlanguage: this.language },
    });
  }

  async deleteFamilyRecruit(
    age = 200,
    message = ""
  ): Promise<void> {
    const user = await this.getUserInfo();
    await this.request("DELETE", "/friend/api/v1/family/recruit", {
      body: {
        age,
        memberName: user.nickName,
        memberType: 2,
        msg: message,
        ownerName: user.nickName,
        ownerType: 2,
      },
      extra: { appversion: "1488", userlanguage: this.language },
    });
  }

  // ─── Clan ─────────────────────────────────────────────────

  async getMyClan(): Promise<ClanInfo> {
    return this.request("GET", "/clan/api/v3/clan/tribe");
  }

  async getMyClanBase(): Promise<ClanInfo> {
    return this.request("GET", "/clan/api/v1/clan/tribe/base");
  }

  async getClanInfo(clanId: number): Promise<ClanInfo> {
    return this.request("GET", "/clan/api/v2/clan/tribe", {
      params: { clanId: clanId.toString() },
    });
  }

  async updateClan(data: {
    name: string;
    details: string;
    headPic: string;
    tags?: string[];
  }): Promise<void> {
    const base = await this.getMyClanBase();
    await this.request("PUT", "/clan/api/v1/clan/tribe", {
      body: {
        clanId: base.clanId,
        currency: 0,
        ...data,
      },
    });
  }

  async getRecommendedClans(): Promise<ClanInfo[]> {
    return this.request("GET", "/clan/api/v1/clan/tribe/recommendation");
  }

  async searchClans(
    query: string,
    page = 0,
    pageSize = 20
  ): Promise<ClanInfo[]> {
    return this.request("GET", "/clan/api/v1/clan/tribe/blurry/info", {
      params: {
        clanName: query,
        pageNo: page.toString(),
        pageSize: pageSize.toString(),
      },
    });
  }

  async getClanRank(page = 0, pageSize = 20): Promise<ClanRankResponse> {
    return this.request("GET", "/clan/api/v1/clan/rank", {
      params: { type: "all", pageNo: page.toString(), pageSize: pageSize.toString() },
      extra: { language: this.language },
    });
  }

  async getClanTasks(type = 0): Promise<ClanTask[]> {
    return this.request("GET", "/clan/api/v3/clan/tasks", {
      params: { type: type.toString() },
    });
  }

  async acceptClanTask(taskId: number, isTeamTask = true): Promise<void> {
    await this.request("PUT", "/clan/api/v1/clan/tasks/accept", {
      params: {
        id: taskId.toString(),
        type: isTeamTask ? "0" : "1",
      },
    });
  }

  async claimClanTask(taskId: number, isTeamTask = true): Promise<unknown> {
    return this.request("PUT", "/clan/api/v1/clan/tasks", {
      params: {
        id: taskId.toString(),
        type: isTeamTask ? "0" : "1",
      },
    });
  }

  async getPersonalClanTasks(): Promise<ClanTask[]> {
    return this.request("GET", "/clan/api/v3/clan/personal/tasks", {
      params: { type: "1" },
    });
  }

  async claimAllClanTasks(): Promise<{ accepted: number; claimed: number; errors: string[] }> {
    const result = { accepted: 0, claimed: 0, errors: [] as string[] };

    try {
      const tasks = await this.getClanTasks();

      if (!Array.isArray(tasks)) {
        result.errors.push("Could not fetch tasks");
        return result;
      }

      for (const task of tasks) {
        try {
          if (task.status === 0) {
            await this.acceptClanTask(task.id, true);
            result.accepted++;
          } else if (task.status === 2) {
            await this.claimClanTask(task.id, true);
            result.claimed++;
          }
        } catch (e) {
          result.errors.push(`Task ${task.id}: ${(e as Error).message}`);
        }
      }
    } catch (e) {
      result.errors.push(`Failed to fetch tasks: ${(e as Error).message}`);
    }

    return result;
  }

  async listClanTasks(): Promise<ClanTaskSummary[]> {
    const tasks = await this.getClanTasks();
    const statusMap: Record<number, "available" | "in_progress" | "claimable"> = {
      0: "available",
      1: "in_progress",
      2: "claimable",
    };

    return tasks.map((t) => ({
      id: t.id,
      name: t.name || `Task #${t.id}`,
      description: t.description || "",
      reward: t.reward || 0,
      rewards: t.rewards || [],
      status: statusMap[t.status] || "available",
      progress: t.progress,
      target: t.target,
      taskType: t.taskType,
      gameId: t.gameId,
    }));
  }

  async claimSpecificTasks(taskIds: number[]): Promise<{ claimed: number; errors: string[] }> {
    const result = { claimed: 0, errors: [] as string[] };

    for (const taskId of taskIds) {
      try {
        await this.claimClanTask(taskId, true);
        result.claimed++;
      } catch (e) {
        result.errors.push(`Task ${taskId}: ${(e as Error).message}`);
      }
    }

    return result;
  }

  async acceptSpecificTasks(taskIds: number[]): Promise<{ accepted: number; errors: string[] }> {
    const result = { accepted: 0, errors: [] as string[] };

    for (const taskId of taskIds) {
      try {
        await this.acceptClanTask(taskId, true);
        result.accepted++;
      } catch (e) {
        result.errors.push(`Task ${taskId}: ${(e as Error).message}`);
      }
    }

    return result;
  }

  async getClanTaskSummary(): Promise<{
    total: number;
    available: number;
    inProgress: number;
    claimable: number;
    totalReward: number;
    totalRewards: ClanTaskReward[];
    tasks: ClanTaskSummary[];
  }> {
    const tasks = await this.listClanTasks();
    const allRewards: ClanTaskReward[] = [];

    for (const task of tasks) {
      if (task.rewards) {
        allRewards.push(...task.rewards);
      }
    }

    return {
      total: tasks.length,
      available: tasks.filter((t) => t.status === "available").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      claimable: tasks.filter((t) => t.status === "claimable").length,
      totalReward: tasks.reduce((sum, t) => sum + t.reward, 0),
      totalRewards: allRewards,
      tasks,
    };
  }

  // ─── Game ─────────────────────────────────────────────────

  async getGameInfo(gameId: string): Promise<GameMetadata> {
    return this.request("GET", `/game/api/v3/games/${gameId}`, {
      params: { appVersion: "5671" },
      auth: false,
    });
  }

  async getGameCatalog(
    page = 0,
    pageSize = 20
  ): Promise<unknown[]> {
    return this.request(
      "GET",
      "/game/api/v2/game/revision/all/list/by/condition/combine",
      {
        params: {
          filterTypeId: "0",
          isFilter: "0",
          os: "android",
          pageNo: page.toString(),
          pageSize: pageSize.toString(),
        },
        auth: false,
      }
    );
  }

  async getGameRooms(
    mode: "" | "PVP" | "RUN" | "CREATE" | "SOCIAL" | "GAME" | "MINING" = "",
    page = 0,
    pageSize = 20
  ): Promise<GameRoom[]> {
    return this.request("GET", "/game/api/v4/gameroom/list", {
      params: {
        mode,
        evList: "10114",
        pageNo: page.toString(),
        pageSize: pageSize.toString(),
      },
    });
  }

  async getGameAuth(
    gameId: string,
    gameVersion = 10114
  ): Promise<GameAuthResponse> {
    return this.request("GET", "/game/api/v3/game/auth", {
      params: {
        typeId: gameId,
        targetId: this.userId.toString(),
        gameVersion: gameVersion.toString(),
      },
    });
  }

  async getPartyEnabledGames(): Promise<PartyGame[]> {
    return this.request("GET", "/game/api/v1/games/all/open/party", {
      params: { appVersion: "5671" },
    });
  }

  async getMiningBalance(): Promise<MiningTokenBalance> {
    return this.request(
      "GET",
      "/game/api/v1/backpack/mining-token/balance/with-transform"
    );
  }

  async getPingServers(): Promise<PingServer[]> {
    return this.request("GET", "/game/api/v1/ping/server/list");
  }

  async getCreativeRooms(page = 0, pageSize = 20): Promise<unknown[]> {
    return this.request("GET", "/game/api/v1/gameroom/creative/list", {
      params: { pageNo: page.toString(), pageSize: pageSize.toString() },
    });
  }

  async getRecentlyPlayedRooms(): Promise<unknown[]> {
    return this.request("GET", "/game/api/v1/gameroom/recent/played", {
      params: { pageNo: "0" },
    });
  }

  async getRecentlyCreatedRooms(): Promise<unknown[]> {
    return this.request("GET", "/game/api/v1/gameroom/recent/created", {
      params: { pageNo: "0" },
    });
  }

  // ─── Backpack ─────────────────────────────────────────────

  async getBackpack(userId?: number): Promise<BackpackItem[]> {
    const uid = userId || this.userId;
    const data = await this.request<{
      pageInfo: { data: BackpackItem[] };
    }>("GET", `/backpack/api/v2/backpack/${uid}`, {
      params: { pageSize: "9999" },
    });
    return data.pageInfo?.data || [];
  }

  async getTicketCount(userId?: number): Promise<number> {
    const items = await this.getBackpack(userId);
    const ticket = items.find((i) => i.itemId === "10068");
    return ticket?.amount || 0;
  }

  // ─── Shop & Payment ───────────────────────────────────────

  async getWealth(): Promise<Wealth> {
    return this.request("GET", "/pay/api/v1/wealth/user");
  }

  async getShopDecorations(
    category: string,
    engineVersion = 10114
  ): Promise<ShopDecoration[]> {
    return this.request(
      "GET",
      `/shop/api/v1/new/shop/decorations/classify/${category}`,
      {
        params: {
          engineVersion: engineVersion.toString(),
          os: "android",
          showVip: "1",
        },
      }
    );
  }

  async getRecommendedDecorations(
    type: "hot" | "new" = "hot",
    engineVersion = 10114
  ): Promise<ShopDecoration[]> {
    return this.request("GET", "/shop/api/v1/new/shop/recommend-decorations", {
      params: {
        engineVersion: engineVersion.toString(),
        type,
        showVip: "1",
        pageNo: "0",
        pageSize: "20",
      },
    });
  }

  async getSuitDecorations(engineVersion = 10114): Promise<ShopSuit[]> {
    return this.request("GET", "/shop/api/v1/new/shop/suit/decorations", {
      params: { os: "android", engineVersion: engineVersion.toString() },
    });
  }

  async getGameShop(
    gameId: string,
    engineVersion = 10114
  ): Promise<ShopDecoration[]> {
    return this.request("GET", "/shop/api/v2/shop/game/props/new", {
      params: { gameId, engineVersion: engineVersion.toString() },
      extra: { language: this.language },
    });
  }

  async buyGameProps(gameId: string, propsId: number): Promise<void> {
    await this.request("PUT", "/shop/api/v2/shop/game/props/new", {
      params: { gameId, propsId: propsId.toString() },
      extra: { language: this.language },
    });
  }

  async getPaymentRedPoints(): Promise<PaymentRedPoints> {
    return this.request("GET", "/pay/api/v1/red-point");
  }

  async claimGameReward(gameId: string): Promise<number> {
    return this.request("PUT", `/game/api/v1/game/${gameId}/turntable`);
  }

  // ─── Decoration ───────────────────────────────────────────

  async getEquippedDecorations(userId?: number): Promise<EquippedDecoration[]> {
    return this.request("GET", "/decoration/api/v1/decorations/using", {
      params: { otherId: userId !== undefined ? userId.toString() : "0" },
    });
  }

  async equipDecoration(decorationId: number): Promise<void> {
    await this.request("PUT", "/decoration/api/v1/decorations/using/new", {
      params: { ids: decorationId.toString() },
    });
  }

  async unequipDecoration(decorationId: number): Promise<void> {
    await this.request("DELETE", "/decoration/api/v1/decorations/using/new", {
      params: { ids: decorationId.toString() },
    });
  }

  async getDecorationRedPoints(): Promise<DecorationRedPoints> {
    return this.request("GET", "/decoration/api/v1/redpoints");
  }

  // ─── Avatar ───────────────────────────────────────────────

  async setAvatar(picUrl: string): Promise<void> {
    await this.request("PUT", "/user/api/v1/user/info", {
      body: { picUrl },
    });
  }

  async uploadFile(
    filePath: string,
    fileName: string,
    fileType: string
  ): Promise<string> {
    const fileData = await fs.promises.readFile(filePath);
    const basename = path.basename(filePath);

    const params: Record<string, string> = { fileName, fileType };
    const signed = signRequest({
      path: "/user/api/v1/file",
      params,
      deviceId: this.deviceId,
    });

    const headers: Record<string, string> = {
      Host: "gw.sandboxol.com",
      userid: this.userId.toString(),
      os: "android",
      userdeviceid: this.deviceId,
      "access-token": this.accessToken,
      "user-agent": "okhttp/4.12.0",
      ...DEFAULT_HEADERS,
      ...signed,
    };

    const queryString = Object.keys(params)
      .sort()
      .map((k) => `${k}=${encodeURIComponent(params[k])}`)
      .join("&");

    const formData = new FormData();
    formData.append("file", new Blob([fileData]), basename);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(
        `https://gw.sandboxol.com/user/api/v1/file?${queryString}`,
        {
          method: "POST",
          headers,
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timer);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed: HTTP ${response.status}: ${text.slice(0, 200)}`);
      }

      const data = (await response.json()) as APIResponse<string>;
      if (data.code !== 1) {
        throw new Error(`Upload failed: ${data.message}`);
      }
      return data.data;
    } catch (error) {
      clearTimeout(timer);
      throw error;
    }
  }

  // ─── Config ───────────────────────────────────────────────

  async getServerTime(): Promise<number> {
    return this.request("GET", "/server-time", { auth: false });
  }

  async checkVersion(): Promise<unknown> {
    return this.request("GET", "/config/files/blockymods-check-version", {
      auth: false,
    });
  }

  // ─── Activity ─────────────────────────────────────────────

  async getActivityHome(): Promise<unknown> {
    return this.request("GET", "/activity/api/v1/activity/home/page");
  }

  async getThemeInfo(): Promise<unknown> {
    return this.request("GET", "/activity/api/v2/theme");
  }

  // ─── Mail ─────────────────────────────────────────────────

  async checkNewMail(): Promise<boolean> {
    return this.request("GET", "/mailbox/api/v1/mail/new");
  }

  async getMailList(): Promise<unknown[]> {
    return this.request("GET", "/mailbox/api/v1/mail");
  }

  async markMailRead(mailId: number): Promise<void> {
    await this.request("PUT", "/mailbox/api/v1/mail", {
      params: { status: "2", ids: mailId.toString() },
    });
  }

  async getUnreadNotifications(): Promise<unknown> {
    return this.request("GET", "/msg/api/v1/user-notification/unread");
  }

  // ─── Group Chat ───────────────────────────────────────────

  async getGroupChatList(page = 0, pageSize = 20): Promise<unknown[]> {
    return this.request("GET", "/msg/api/v1/msg/group/chat/list", {
      params: { pageNo: page.toString(), pageSize: pageSize.toString() },
    });
  }
}
