export class ArrayUtil {

  public static isEmpty(arr:any[]): boolean {
    return !ArrayUtil.isNotEmpty(arr);
  }

  public static isNotEmpty(arr:any[]): boolean {
    return arr && arr.length > 0;
  }

}
