export class StringUtil {

  public static isEmpty(str: string): boolean {
    return !StringUtil.isNotEmpty(str);
  }

  public static isNotEmpty(str: string): boolean {
    return str && str.length > 0;
  }

}
