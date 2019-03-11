export class User {
  private userId: string;
  constructor(userId: string) {
    this.userId = userId;
  }

  public getUserId() {
    return this.userId;
  }
}
