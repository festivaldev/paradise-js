import PlayerCardView from './PlayerCardView';
import PlayerStatisticsView from './PlayerStatisticsView';

export default class UberstrikeMemberView {
  public PlayerCardView: PlayerCardView;
  public PlayerStatisticsView: PlayerStatisticsView;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }

  public toString(): string {
    return `[Uberstrike member view: ${this.PlayerCardView ? this.PlayerCardView.toString() : ''}${this.PlayerStatisticsView ? this.PlayerStatisticsView.toString() : ''}]`;
  }
}
