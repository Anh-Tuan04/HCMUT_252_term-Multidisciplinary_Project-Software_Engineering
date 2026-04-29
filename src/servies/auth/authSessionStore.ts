import type { AuthSession, RecoverySession } from "../../types/auth";

const SESSION_KEY = "smart-parking-auth-session-v1";
const RECOVERY_KEY = "smart-parking-auth-recovery-v1";

const parseJson = <TValue>(raw: string | null): TValue | null => {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TValue;
  } catch {
    return null;
  }
};

export interface AuthSessionStore {
  readSession(): AuthSession | null;
  writeSession(value: AuthSession): void;
  clearSession(): void;
  readRecovery(): RecoverySession | null;
  writeRecovery(value: RecoverySession): void;
  clearRecovery(): void;
}

export class LocalStorageAuthSessionStore implements AuthSessionStore {
  readSession(): AuthSession | null {
    if (typeof window === "undefined") {
      return null;
    }

    return parseJson<AuthSession>(window.localStorage.getItem(SESSION_KEY));
  }

  writeSession(value: AuthSession): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(value));
  }

  clearSession(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(SESSION_KEY);
  }

  readRecovery(): RecoverySession | null {
    if (typeof window === "undefined") {
      return null;
    }

    const recovery = parseJson<RecoverySession>(window.localStorage.getItem(RECOVERY_KEY));
    if (!recovery) {
      return null;
    }

    if (Date.now() > recovery.expiresAt) {
      this.clearRecovery();
      return null;
    }

    return recovery;
  }

  writeRecovery(value: RecoverySession): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(RECOVERY_KEY, JSON.stringify(value));
  }

  clearRecovery(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(RECOVERY_KEY);
  }
}
