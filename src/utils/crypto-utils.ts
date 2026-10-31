import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";

const PBKDF2_ITERATIONS = 600000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

/**
 * Encrypt HTML content with AES-256-GCM using a PBKDF2-derived key.
 *
 * [CUSTOM] 原实现用 HMAC(password, `salt:${slug}` / `iv:${slug}`) 确定性派生 salt 与 IV，
 * 同一篇文章 + 同一密码每次构建得到的 key 与 nonce 完全相同。AES-GCM 下 nonce 复用是
 * 致命弱点：两版密文的 XOR 等于两版明文的 XOR，还可反推认证密钥（AUDIT P1-7）。
 * 现改为每次加密随机生成 salt 与 IV，随密文一起序列化（解密端本来就按
 * base64(salt[16] + iv[12] + authTag[16] + ciphertext) 解析，无需改动），
 * 同时把 PBKDF2 迭代数从 10 万提到 60 万。
 *
 * 注意：客户端 `src/components/features/EncryptedContent.astro` 里的 ITERATIONS
 * 必须与此处保持一致，改一处就要改另一处。
 *
 * Output format: base64(salt[16] + iv[12] + authTag[16] + ciphertext)
 */
export function encryptContent(
	html: string,
	password: string,
	slug: string,
): string {
	// slug 仅为保持调用签名兼容；随机 salt/IV 后它不再参与密钥派生。
	void slug;

	const salt = randomBytes(SALT_LENGTH);
	const iv = randomBytes(IV_LENGTH);
	const key = pbkdf2Sync(
		password,
		salt,
		PBKDF2_ITERATIONS,
		KEY_LENGTH,
		"sha256",
	);

	const cipher = createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([
		cipher.update(html, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();

	const result = Buffer.concat([salt, iv, authTag, encrypted]);
	return result.toString("base64");
}
