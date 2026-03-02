import crypto from "crypto"

function getKey() {
  const secret = process.env.TOKEN_ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("Missing TOKEN_ENCRYPTION_SECRET or NEXTAUTH_SECRET")
  }
  return crypto.createHash("sha256").update(secret).digest()
}

export function encryptText(plain: string) {
  const iv = crypto.randomBytes(16)
  const key = getKey()
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`
}
