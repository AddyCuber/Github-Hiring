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

export function decryptText(ciphertext: string) {
  const [ivHex, encHex] = ciphertext.split(":")
  if (!ivHex || !encHex) {
    throw new Error("Invalid ciphertext format")
  }
  const iv = Buffer.from(ivHex, "hex")
  const key = getKey()
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()])
  return decrypted.toString("utf8")
}
