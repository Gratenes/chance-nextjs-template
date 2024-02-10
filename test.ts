import { nanoid } from 'nanoid'
import { SignJWT, importPKCS8 } from 'jose'

export interface PaperRSAJWTPayload {
  ticket: string
  fabId: string
  entity: string
  aud?: string
  kid?: string
}

const alg = 'RS256'

export async function generateNewRSAToken() {

  const privateKey = await importPKCS8("-----BEGIN PRIVATE KEY-----\n" +
    "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCd4Lzol2SCEd+O\n" +
    "v5VwNJ+mxZY6Ft8Q3/e6gA94OpHFXyU89tfrC7xZp/TWHIHUEEwOXg17MCqOoyUM\n" +
    "tA9Tp025yvT0hwuvSjNucVLD4asIn1kL3XbyXwAGVEaPw0jEiT3le5rc52MEXgHO\n" +
    "Gy18PZ9QO50F4ewo1L0yCaknMAwQmZDzCaFcZMUBzcEUQUV7pKO2a5h6P8OS5iJV\n" +
    "E44yfYZA/hKK39gE5fJboqDWTmyodiSy7EU0ulEQE5gKZ124QnNyqo3Y6AtNIS8i\n" +
    "yNHn4LWN9GAdilt1cdRFt9FD8K6RU7Z6rqXKNvTw0bhGv+JUusSVPbDiXrShWjlI\n" +
    "CwlY++p9AgMBAAECggEAAaaYKxFsLFz9+qrfp+Lw+Wgu/DABiJZi63kL0FzCae8m\n" +
    "/0ZwdwVyJHjYW0XEiMBb3zmWB//2rfOgP0wBrgT9j9ACtCzWTzCmLYUzUZeCN46c\n" +
    "+n4IEJw0LpzCeR3YXK+3rTbX5W/o7eKCv9IybU5ipE7fQzC7zKh+yu9lbKK4uZKx\n" +
    "RTj8fUZG6EzT2p4+w4ql0SiBdViq92xpX3SQKwhyaO+kxl99JLPu78qQtdHEJSeo\n" +
    "3/gPBigJiUIQqXhOkR/zGW+1qsYaSvikj1CHIOLXU783RYcQwuGDvotJyuPzqAoN\n" +
    "Ff4BaIUmc6vklJxzdUSmQLveC5dFExDWTZckamSN+QKBgQDYyiR6dARV8xpYHqTA\n" +
    "iaoyLj/yPVywuNXnQa1OB/6R5C6iuFcohjY1Wpr24EnNk+DMxA2+tlr202g8fCXI\n" +
    "pS9VRoLj2Ncs8cTgvn/N9RiwC4rKb2awbNe2xB+7ERDR3C9dOe01zq0DkJ5mYNbZ\n" +
    "SZQNwpLaG38l9E/KKrstWMgvGQKBgQC6bti+lGg2DoUHGaAcy1hcH4oHnMIUx237\n" +
    "zXgi/Yd5lvnyYnPyA9dhNGW2tL4eyHHXdvkNdvijQZThAZzRJ23QyhEGAIaF+eDq\n" +
    "8LiNXesnAYJT7nUAgvEdND/jUwFH1jhh1Em9ff3zrxXOTQIiFdoHGBwGVM/OD2ud\n" +
    "j0a0S03XBQKBgQCfITJJmGOeW4YY7NVuZx7BGuXhgF1Lc0HAMJtvzbp1iJMa6kk/\n" +
    "+9RKsalSUiyadFPsunSEawK2b1PyIgbyEx59b/agHQlFempTtkHGAoUOpEpKch9k\n" +
    "nWByTeAkxlAcW42A1wZiGsUw+rTq3WaXtMSynQKCivB4Aa+X7GnczXCT8QKBgQCc\n" +
    "Be5wuITqUIZ2JbUAxBEjr+V1b3RhrXFXHWLgbas2T+rINirwrNRQbmh9WpAN9RSJ\n" +
    "DPFrmliFUHpHQHE7/TKDXMiYbFIox7G7DVB2RtZoo3OtyE+06ODe3v5kwe+9bgNr\n" +
    "pB0+b7XbfXjTWVFis0TvUPcLOWlb+z3F88VpV+hB/QKBgDM4rxC33Ney5svCiRyk\n" +
    "rNIdSbozzYx7RC+V1zyYXVsO0pnnZsWlAEZi4xT/e4H3YfZ3+dX8+H8ss1GQTd4+\n" +
    "2IPqlWoBJeBITk5iN5mtS4iBiJP6Ijv0IWri0p43aFbjmCUvOtWsolVTgNSRn32/\n" +
    "qPFJTl+3QT3+tygf6OsU7k1R\n" +
    "-----END PRIVATE KEY-----", alg)

  let token = "";
  try {
    token = await new SignJWT({
      sub: `fuck@sdfgsdfgdsgsdfg.com`,
      email: `fuck@sdfgsdfgdsgsdfg.com`,
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer("sdfgsdfgdsgsdfg.com")
      .setIssuedAt()
      .setAudience("sdfgsdfgdsgsdfg.com")
      .setExpirationTime('24h')
      .setJti(nanoid())
      .sign(privateKey)
  } catch (error) {
    console.log(error)
  }

  return token
}