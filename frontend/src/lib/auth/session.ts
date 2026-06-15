import { db } from "@/lib/db/schema";
import { api } from "@/lib/api/client";
import type { Usuario } from "@/types/domain";

const SESSION_ID = "current";
const OFFLINE_MAX_MS = 7 * 24 * 60 * 60 * 1000; // BR-ACESSO-004

export function getDeviceId(): string {
  const key = "cocal_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export async function saveSession(pair: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  usuario: Usuario;
}): Promise<void> {
  await db.session.put({
    id: SESSION_ID,
    access_token: pair.access_token,
    refresh_token: pair.refresh_token,
    expires_at: Date.now() + pair.expires_in * 1000,
    usuario: pair.usuario,
  });
}

export async function clearSession(): Promise<void> {
  const session = await db.session.get(SESSION_ID);
  if (session?.refresh_token && navigator.onLine) {
    try {
      await api.logout(session.refresh_token);
    } catch {
      /* offline logout still clears local */
    }
  }
  await db.session.delete(SESSION_ID);
}

export async function getSession() {
  return db.session.get(SESSION_ID);
}

export async function getValidAccessToken(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;

  if (session.expires_at > Date.now()) {
    return session.access_token;
  }

  if (!navigator.onLine) {
    const stored = await db.session.get(SESSION_ID);
    if (!stored) return null;
    const sessionAge = Date.now() - (stored.expires_at - 30 * 60 * 1000);
    if (sessionAge > OFFLINE_MAX_MS) return null;
    return stored.access_token;
  }

  try {
    const pair = await api.refresh(session.refresh_token);
    await saveSession(pair);
    return pair.access_token;
  } catch {
    return null;
  }
}

export async function isSessionValid(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  if (navigator.onLine) {
    const token = await getValidAccessToken();
    return token !== null;
  }
  const issuedApprox = session.expires_at - 30 * 60 * 1000;
  return Date.now() - issuedApprox < OFFLINE_MAX_MS;
}

export async function getUsuario(): Promise<Usuario | null> {
  const session = await getSession();
  return session?.usuario ?? null;
}
