import PointsDepositType from './PointsDepositType';

export default class PointDepositView {
  public PointDepositId: int;
  public DepositDate: DateTime;
  public Points: int;
  public Cmid: int;
  public IsAdminAction: bool;
  public DepositType: PointsDepositType;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
