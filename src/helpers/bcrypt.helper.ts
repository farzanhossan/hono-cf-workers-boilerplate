import bcrypt from "bcryptjs";

export class BcryptHelper {
  private saltRounds: number;

  constructor(saltRounds: number = 12) {
    this.saltRounds = saltRounds;
  }

  public async hash(plainText: string, saltRounds?: number): Promise<string> {
    return await bcrypt.hash(plainText, saltRounds || this.saltRounds);
  }

  public async compareHash(
    plainText: string,
    hashString: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainText, hashString);
  }
}
