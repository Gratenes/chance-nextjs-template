import {importPKCS8, jwtVerify, JWTVerifyResult, KeyLike, SignJWT} from "jose";
import {secret} from "@/app/api/auth";
import {nanoid} from "nanoid";


interface CreatTokenPayload {
  provider: string,
  email: string,
  sub: string,

  [key: string]: string
}


let privateKey: KeyLike | Uint8Array;
export const getPrivateKey = async () => {
  return privateKey = privateKey || await importPKCS8(Buffer.from(secret, 'base64').toString('utf-8'), 'RS256')
}

export const createToken = async (data: CreatTokenPayload, expiration: Date) => {
  const privateKey = await getPrivateKey()
  return await new SignJWT({
    ...data
  })
    .setProtectedHeader({alg: 'RS256',})
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(privateKey)
}

export const decodeToken = async <T>(sessionTokenString: string): Promise<JWTVerifyResult<T> | false> => {
  try {
    const privateKey = await getPrivateKey()
    return await jwtVerify<T>(sessionTokenString, privateKey)
  } catch (e) {
    return false
  }
}