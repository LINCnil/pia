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
    return num < 5 ? 'a few' : Math.round(num);
  };

  constructor(str: string) {
    this.strDate = str;
    this.s = ( +new Date() - Date.parse(str) ) / 1e3;
    this.m = this.s / 60;
    this.h = this.m / 60;
    this.d = this.h / 24;
    this.w = this.d / 7;
    this.y = this.d / 365.242199;
    this.M = this.y * 12;
  }

  public complete() {
    return this.s <= 1 ? 'just now'
    : this.m < 1  ? this.approx(this.s) + ' seconds ago'

    : this.m <= 1 ? 'a minute ago'
    : this.h < 1  ? this.approx(this.m) + ' minutes ago'

    : this.h <= 1 ? 'an hour ago'
    : this.d < 1  ? this.approx(this.h) + ' hours ago'

    : this.d <= 1 ? 'yesterday'
    : this.w < 1  ? this.approx(this.d) + ' days ago'

    : this.w <= 1 ? 'last week'
    : this.M < 1  ? this.approx(this.w) + ' weeks ago'

    : this.M <= 1 ? 'last month'
    : this.y < 1  ? this.approx(this.M) + ' months ago'

    : this.y <= 1 ? 'a year ago'
    : this.approx(this.y) + ' years ago';
  }

  public simple() {
    return this.d < 1  ? 'today'

    : this.d <= 1 ? 'yesterday'
    : this.w < 1 ? 'less then a week'

    : this.w <= 1 || this.M < 1  ? 'ealier in month'

    : this.M <= 1 ||  this.y < 1  ? new Date(this.strDate).getUTCMonth()

    : this.y <= 1 ? 'a year ago'
    : this.approx(this.y) + ' years ago';
  }
}
