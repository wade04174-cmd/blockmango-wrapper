import { createHash, publicEncrypt, randomBytes } from "crypto";

const KEY_PAIRS: [string, string][] = [
  [
    "6aDtpIdzQdgGwrpP6HzuPA",
    "9EuDKGtoWAOWoQH1cRng-d5ihNN60hkGLaRiaZTk-6s",
  ],
  [
    "h0jCHbhVd9Fpkx-FGkxeRw",
    "lOTB7DNdMMpdyUO-psJ5b2ivYGmU5RAy6j6bkpoMYcs",
  ],
  [
    "dM9XM3sxjfVI6AC77GS9rw",
    "6aNQVhd8pP-Gg7_xM2PTEp92G-77tzHGnPKrwslxmAg",
  ],
];

const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCLzlsA+3wXCAph80r/xs1bWhVr
sJSOQmSBTA0GaBpVIzXqFBaibDmYA3WJDM9rcQ7KpYSyrJ02iFlsN43RnizrHfS+x
PtdwuxBQ2Clow5cYPZucqQYL9HIlbBLoighH2eGQqGlVadL7r384iKTz9mmckSUa8
hhJzS+WwUAqVO3DwIDAQAB
-----END PUBLIC KEY-----`;

function randomHex(length: number): string {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

function md5(data: string): string {
  return createHash("md5").update(data, "utf8").digest("hex");
}

export function encryptPassword(password: string): string {
  const buffer = Buffer.from(password, "utf8");
  const encrypted = publicEncrypt(
    {
      key: RSA_PUBLIC_KEY,
      padding: 1, // RSA_PKCS1_PADDING
    },
    buffer
  );
  return encrypted.toString("base64");
}

export interface SignedHeaders {
  "x-apikey": string;
  "x-nonce": string;
  "x-time": string;
  "x-sign": string;
  "x-urlpath": string;
}

export interface SignOptions {
  path: string;
  params?: Record<string, string>;
  body?: string;
  deviceId?: string;
}

export function signRequest(options: SignOptions): SignedHeaders {
  const { path, params = {}, body = "", deviceId } = options;
  const [ak, sk] = KEY_PAIRS[Math.floor(Math.random() * KEY_PAIRS.length)];
  const nonce = randomHex(32);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");

  const signInput = `${ak}${path}${nonce}${timestamp}${sortedParams}${body}${sk}`;
  const firstHash = md5(signInput);

  let sign: string;
  if (deviceId) {
    sign = md5(firstHash + deviceId);
  } else {
    sign = firstHash;
  }

  return {
    "x-apikey": ak,
    "x-nonce": nonce,
    "x-time": timestamp,
    "x-sign": sign,
    "x-urlpath": path,
  };
}

export { KEY_PAIRS, md5, randomHex };
