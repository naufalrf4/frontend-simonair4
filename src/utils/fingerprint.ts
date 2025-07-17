function hashString(str: string): string {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return (hash >>> 0).toString(16);
}

export async function getBrowserFingerprint(): Promise<string> {
  const { userAgent, language, platform } = navigator;
  const screenInfo = `${screen.width}x${screen.height}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const fingerprint = [userAgent, language, platform, screenInfo, timeZone].join('||');
  const hashedFingerprint = hashString(fingerprint);

  return hashedFingerprint;
}

async function importKeyFromFingerprint(fingerprint: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawKey = enc.encode(fingerprint.slice(0, 32).padEnd(32, '0'));
  return crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptToken(token: string, fingerprint: string): Promise<string> {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await importKeyFromFingerprint(fingerprint);
    const encoder = new TextEncoder();
    const encodedToken = encoder.encode(token);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedToken,
    );

    const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.byteLength);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    throw error;
  }
}

export async function decryptToken(
  encryptedToken: string,
  fingerprint: string,
): Promise<string | null> {
  try {
    const data = Uint8Array.from(atob(encryptedToken), (c) => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const cipher = data.slice(12);
    const key = await importKeyFromFingerprint(fingerprint);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    return null;
  }
}
