export class User {
  private userId: string;
  private selected: boolean;
  constructor(userId: string) {
    this.userId = userId;
    this.selected = false;
  }

  public getUserId() {
    return this.userId;
  }
  public isSelected() {
    return this.selected;
  }
  public setSelected(value: boolean){
    this.selected = value;
  }
}
