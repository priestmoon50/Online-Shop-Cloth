// 📁 src/utils/TokenService.ts

interface JWTPayload {
  exp: number;
  iat?: number;
  [key: string]: unknown;
}

class TokenService {
  private readonly tokenKey = "token";
  private readonly isBrowser = typeof window !== "undefined";

  setToken(token: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error("❌ Failed to store token:", error);
    }
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error("❌ Failed to retrieve token:", error);
      return null;
    }
  }

  removeToken(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.error("❌ Failed to remove token:", error);
    }
  }

  isTokenValid(): boolean {
    const payload = this.getTokenPayload();
    if (!payload || typeof payload.exp !== "number") return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  }

  getTokenPayload(): JWTPayload | null {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeJWT(token);
  }

  private decodeJWT(token: string): JWTPayload | null {
    try {
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("❌ Failed to decode JWT:", error);
      return null;
    }
  }
}

export default new TokenService();
