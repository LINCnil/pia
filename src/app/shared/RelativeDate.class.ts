export class RelativeDate {
  private strDate;
  private s;
  private m;
  private h;
  private d;
  private w;
  private y;
  private M;

  approx(num) {
    return Math.round(num);
  }

  constructor(str: string) {
    this.strDate = str;
    this.s = (+new Date() - Date.parse(str)) / 1e3;
    this.m = this.s / 60;
    this.h = this.m / 60;
    this.d = this.h / 24;
    this.w = this.d / 7;
    this.y = this.d / 365.242199;
    this.M = this.y * 12;
  }

  private getMonday(d) {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  public complete() {
    return this.s <= 1
      ? 'just now'
      : this.m < 1
      ? this.approx(this.s) + ' seconds ago'
      : this.m <= 1
      ? 'a minute ago'
      : this.h < 1
      ? this.approx(this.m) + ' minutes ago'
      : this.h <= 1
      ? 'an hour ago'
      : this.d < 1
      ? this.approx(this.h) + ' hours ago'
      : this.d <= 1
      ? 'yesterday'
      : this.w < 1
      ? this.approx(this.d) + ' days ago'
      : this.w <= 1
      ? 'last week'
      : this.M < 1
      ? this.approx(this.w) + ' weeks ago'
      : this.M <= 1
      ? 'last month'
      : this.y < 1
      ? this.approx(this.M) + ' months ago'
      : this.y <= 1
      ? 'a year ago'
      : this.approx(this.y) + ' years ago';
  }

  public simple() {
    const today = new Date();
    const date = new Date(this.strDate);
    let res: string = null;

    if (this.w < 1) {
      // Last 7 days
      res = 'Earlier in this month';

      // Current week
      if (
        this.getMonday(new Date()).getDate() ===
        this.getMonday(this.strDate).getDate()
      ) {
        res = 'Earlier in this week';

        // Today
        if (date.getDate() === today.getDate()) {
          res = 'today';
        }

        // Yesterday
        if (
          date.getDate() ===
          new Date(new Date().setDate(new Date().getDate() - 1)).getDate()
        ) {
          res = 'yesterday';
        }
      }
    } else if (this.M < 1 && date.getMonth() === today.getMonth()) {
      // Last Month
      res = 'Earlier in this month';
    } else {
      // Other Month + Full year
      res = 'translate-month';
    }

    return res;
  }
}
