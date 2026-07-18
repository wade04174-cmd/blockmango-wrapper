export interface APIResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  other?: unknown;
}

export interface UserProfile {
  userId: number;
  sex: number;
  nickName: string;
  picUrl: string;
  picType: number;
  decorationPicUrl: string;
  telephone: string;
  email: string;
  birthday: string;
  details: string;
  diamonds: number;
  golds: number;
  vipLevel: number;
  userLevel: number;
  region: string;
  createTime: number;
  country?: string;
  language?: string;
  clothVoucherCount?: number;
  registerTime?: number;
  status?: number;
  gameId?: string;
  gameName?: string;
  logoutTime?: number;
  userGameDataResponse?: {
    userGameCareerInfo?: UserCareer;
    userGameMonthInfo?: UserCareer;
  };
}

export interface FriendUser {
  userId: number;
  nickName: string;
  picUrl: string;
  decorationPicUrl: string;
  alias: string | null;
  status: number;
  gameId: string | null;
  gameName?: string;
  partyInfo: Record<string, unknown> | null;
  vip: number;
  sex: number;
  details: string;
  clanId: number;
  clanName: string | null;
  role: number;
  logoutTime?: number;
}

export interface FriendStatusResponse {
  status: FriendUser[];
  currentTime: number;
}

export interface SecuritySettings {
  userId: number;
  email: string;
  bindEmail: boolean;
  secretQuestionList: unknown[];
  ids: unknown[];
  country: string;
  region: string;
}

export interface UserCareer {
  userId?: number;
  completeRate: number;
  victoryRate: number;
  killCount: number;
  averageTime: number;
  totalTime: number;
  timeCount: number;
  totalPlayedCount: number;
  friendNum: number;
  familyNum: number;
  decorationCount: number;
  suitCount: number;
  gameTimeMap?: Record<string, number>;
}

export interface UserShopInfo {
  userId: number;
  diamonds: number;
  golds: number;
  clothVoucher: number;
  gdiamonds: number;
}

export interface UserVip {
  userId: number;
  lv: number;
  exp: number;
  maxExp: number;
  vipIcon: string;
}

export interface Popularity {
  popularity: number;
  like: number;
  hasNewLikes: boolean | null;
}

export interface Wealth {
  userId: number;
  diamonds: number;
  golds: number;
  gDiamonds: number;
  gDiamondsProfit: number;
  money: number;
  ngDiamonds: number;
  sameUser: boolean;
  firstPunch: boolean;
}

export interface ShopDecoration {
  id: number;
  typeId: number;
  camera: string;
  name: string | null;
  iconUrl: string;
  sex: number;
  tag: string[];
  resourceId: string;
  details: string | null;
  expire: number;
  price: number;
  discountPrice: number | null;
  clothVoucherPrice: number;
  discountClothVoucherPrice: number | null;
  currency: number;
  quantity: number;
  isNew: number;
  hasPurchase: number;
  status?: number;
  validate?: number;
}

export interface ShopSuit {
  suitId: number;
  iconUrl: string;
  currency: number;
  name: string;
  details: string;
  isNew: number;
  sex: number;
  isRecommend: number;
  quantity: number;
  hasPurchase: number;
  limitedTimes: unknown[];
  discountPrices: unknown | null;
  shopDecorationInfos: ShopDecoration[];
}

export interface EquippedDecoration {
  id: number;
  typeId: number;
  camera: string;
  name: string;
  iconUrl: string;
  status: number;
  sex: number;
  resourceId: string;
  details: string;
  expire: number;
  type: number;
  clanLevel: number;
  vip: number;
  occupyPosition: string[];
  buyTime: unknown | null;
}

export interface DecorationInfo {
  id: number;
  typeId: number;
  camera: string;
  name: string;
  iconUrl: string;
  sex: number;
  tag: string[];
  resourceId: string;
  details: string | null;
  expire: number;
  type: number;
  status: number;
  price: number;
  clothVoucherPrice: number;
  currency: number;
  occupyPosition: string[];
}

export interface GameRoom {
  roomId: string;
  name: string;
  userId: number;
  nickName: string;
  picUrl: string;
  language: string;
  mode: string;
  gameType: string;
  gameName: string;
  gameIconUrl: string;
  engineType: number;
  curUsers: number;
  maxUsers: number;
  gameAddr: string;
  regionId: number;
  mapAddress: string;
  needPassword: boolean;
  miningLevel: number;
  totalPoolValue: number;
  remainingPoolValue: number;
  miningRewardBonus: number;
  newDeviceRebateRatio: number;
  miningStatus: string;
}

export interface GameServer {
  region: number;
  clan: string;
  url: string;
}

export interface GameDispatch {
  gid: string;
  gaddr: string;
  name: string;
  mid: string;
  mname: string;
  downurl: string;
  region: number;
  resVersion: number;
  requestIds: Record<string, unknown>;
  gameType: string;
  cdns: CDNMirror[];
}

export interface GameAuthResponse {
  token: string;
  signature: string;
  timestamp: number;
  region: number;
  dispUrl: string;
  engineType: string;
  country: string;
  launchTraceId: string;
  staging: boolean;
}

export interface GameResource {
  durl: string;
  resVersion: number;
  size: number;
  md5: string;
  cdns: CDNMirror[];
}

export interface GameMetadata {
  gameId: string;
  gameTitle: string;
  bannerPic: string[];
  gameDetail: string;
  praiseNumber: number;
  gameCoverPic: string;
  isPublish: number;
  visitorEnter: number;
  version: number;
  engineVersion: number;
  onlineNumber: number;
  gameTypes: string[];
  isNewEngine: number;
  isUgcGame: number;
}

export interface PartyGame {
  gameId: string;
  gameName: string;
  isNewEngine: number;
  onlineNumber: number;
  picUrl: string;
  isUgcGame: number;
  engineVersion: number;
  isGameMode: number;
  gameDetail: string;
}

export interface ClanInfo {
  clanId: number;
  name: string;
  headPic: string;
  tags: string[];
  details: string;
  level: number;
  chiefId: number;
  chiefNickName: string;
  currentCount: number;
  maxCount: number;
  freeVerify: number;
  experience?: number;
  region?: string;
}

export interface GroupChat {
  ownerId: number;
  groupId: string;
  groupPic: string | null;
  groupName: string;
  groupNotice: string | null;
  noticePic: string[];
  officialGroup: number;
  releaseTime: string;
  ownerRegion: string;
  forbiddenWordsStatus: number;
  inviteStatus: number;
  groupMembers: unknown[];
}

export interface AvatarFrame {
  id: string;
  resourceId: string;
  picUrl: string;
  status: number;
  priority: number;
  name: string;
  desc: string;
}

export interface PaymentRedPoints {
  monthCard: boolean;
  directPurchase: boolean;
}

export interface DecorationRedPoints {
  summary: number;
  newPublish: number;
}

export interface AuthTokenResponse {
  userId: number;
  accessToken: string;
  clientIp: string;
  httpDN: string | null;
  httpsDN: string | null;
  country: string;
  region: string;
  cuboOpenId: string | null;
  isNewUser: boolean;
}

export interface MiningTokenBalance {
  tokenAmount: number;
  subTokenAmount: number;
  itemInfoMap: Record<string, unknown>;
  transformInfoList: unknown[];
  isTransform: boolean;
}

export interface UGCWork {
  id: number;
  archiveId: number;
  mapId: string;
  userId: number;
  userNickname: string;
  userAvatar: string;
  workName: string;
  workIcon: string;
}

export interface PingServer {
  region: number;
  clan: string;
  url: string;
}

export interface UserHighlights {
  userId: number;
  gamePreferences: unknown[];
}

export interface CDNMirror {
  cdnId: string;
  cdnName: string;
  cdnUrl: string;
  url: string;
}

export interface LoginResponse {
  accessToken: string;
  userId: number;
}

export interface BackpackItem {
  itemId: string;
  amount: number;
  [key: string]: unknown;
}

export interface ClanRankResponse {
  pageInfo: {
    totalSize: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface FamilyRecruit {
  ownerId: number;
  nickName: string;
  status: number;
  age?: number;
  msg?: string;
  [key: string]: unknown;
}

export interface ClanTaskReward {
  type: string;
  amount: number;
  [key: string]: unknown;
}

export interface ClanTask {
  id: number;
  type: number;
  name: string;
  description: string;
  reward: number;
  rewards?: ClanTaskReward[];
  status: number; // 0 = available, 1 = in progress, 2 = claimable
  progress?: number;
  target?: number;
  taskType?: number;
  gameId?: string;
  [key: string]: unknown;
}

export interface ClanTaskSummary {
  id: number;
  name: string;
  description: string;
  reward: number;
  rewards: ClanTaskReward[];
  status: "available" | "in_progress" | "claimable";
  progress?: number;
  target?: number;
  taskType?: number;
  gameId?: string;
}

export interface ClaimResult {
  account: string;
  userId: number;
  accepted: number;
  claimed: number;
  tasks: ClanTaskSummary[];
  errors: string[];
}
