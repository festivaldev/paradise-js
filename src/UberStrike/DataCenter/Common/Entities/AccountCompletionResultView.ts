export default class AccountCompletionResultView {
  public Result: int;
  public ItemsAttributed?: Dictionary<int, int> = {};
  public NonDuplicateNames?: List<string> = [];

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
