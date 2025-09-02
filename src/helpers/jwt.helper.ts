import { sign, verify } from "@tsndr/cloudflare-worker-jwt";
import { HTTPException } from "hono/http-exception";

export class JWTHelper {
  constructor(private secret: string) {}

  public async sign(
    payload: any,
    options: { expiresIn?: string } = {}
  ): Promise<string> {
    const { expiresIn = "1h" } = options;
    const exp = Math.floor(Date.now() / 1000) + this.parseExpiresIn(expiresIn);

    return await sign({ ...payload, exp }, this.secret, { algorithm: "HS512" });
  }

  public async verify(token: string): Promise<any> {
    try {
      const isValid = await verify(token, this.secret);
      if (!isValid) {
        throw new HTTPException(401, {
          message: "Unauthorized Access Detected",
        });
      }

      const [, payloadBase64] = token.split(".");
      return JSON.parse(atob(payloadBase64));
    } catch (error) {
      throw new HTTPException(401, { message: "Unauthorized Access Detected" });
    }
  }

  public extractToken(headers: Record<string, string>): string {
    let token = headers?.authorization || "";
    return token.replace(/Bearer\s+/gm, "");
  }

  public async makeAccessToken(
    data: any,
    expiresIn: string = "1h"
  ): Promise<string> {
    return this.sign(data, { expiresIn });
  }

  public async makeRefreshToken(
    data: any,
    expiresIn: string = "7d"
  ): Promise<string> {
    return this.sign({ ...data, isRefreshToken: true }, { expiresIn });
  }

  private parseExpiresIn(expiresIn: string): number {
    const units: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // default 1 hour

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }
}
