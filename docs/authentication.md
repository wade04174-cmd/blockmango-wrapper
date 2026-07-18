# Authentication

## Request Signing

Every request to `gw.sandboxol.com` requires signed headers.

### Required Headers

| Header | Description |
|--------|-------------|
| `x-apikey` | API key (randomly selected from 3 static pairs) |
| `x-nonce` | Random 32-char hex string |
| `x-time` | Unix timestamp |
| `x-sign` | MD5 signature |
| `x-urlpath` | Request path |
| `userid` | User ID (authenticated requests) |
| `access-token` | Session token (authenticated requests) |
| `userdeviceid` | Device fingerprint |
| `language` | Language code (required, causes 400 without it) |
| `userlanguage` | Language code (also required) |

### Signature Algorithm

```
sign_input = apikey + path + nonce + timestamp + sorted_params + body + secret_key
first_hash = md5(sign_input)
sign = md5(first_hash + device_id)  // if device_id provided
```

### API Key Pairs

| API Key | Secret Key |
|---------|------------|
| `6aDtpIdzQdgGwrpP6HzuPA` | `9EuDKGtoWAOWoQH1cRng-d5ihNN60hkGLaRiaZTk-6s` |
| `h0jCHbhVd9Fpkx-FGkxeRw` | `lOTB7DNdMMpdyUO-psJ5b2ivYGmU5RAy6j6bkpoMYcs` |
| `dM9XM3sxjfVI6AC77GS9rw` | `6aNQVhd8pP-Gg7_xM2PTEp92G-77tzHGnPKrwslxmAg` |

### Login Headers

Login uses additional headers:

| Header | Value |
|--------|-------|
| `bmg-device-id` | Device fingerprint |
| `bmg-sign` | Device signature |
| `apptype` | `WZRD-TOOL` |

Login signing does NOT include the device ID in the signature (device=None).

### RSA Password Encryption

Passwords are encrypted before transmission:
- Algorithm: RSA/ECB/PKCS1v1.5
- Key: 1024-bit
- Encoding: Base64

### Response Format

```json
{ "code": 1, "message": "SUCCESS", "data": {} }
```

Code 1 = success. Code 6 = token expired. Code 140 = CAPTCHA required.

### CAPTCHA Handling

When the server requires CAPTCHA (code 140), the wrapper throws `CaptchaError`:

```typescript
import { BlockmanGOClient, CaptchaError } from "blockmango-wrapper";

try {
  await BlockmanGOClient.login("user", "pass");
} catch (e) {
  if (e instanceof CaptchaError) {
    console.log("CAPTCHA required, try again later");
  }
}
```

CAPTCHA is triggered by:
- Too many login attempts from same IP
- Suspicious device IDs
- Server-side rate limiting
