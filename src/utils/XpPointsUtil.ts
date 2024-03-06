import { ApplicationConfiguration } from '@/models';
import { ApplicationConfigurationView } from '@/UberStrike/Core/Models/Views';

export default class XpPointsUtil {
  private static Config: ApplicationConfigurationView;

  static async _initialize() {
    this.Config = new ApplicationConfigurationView({
      ...await ApplicationConfiguration.findOne({ raw: true }),
    });
  }

  public static GetXpRangeForLevel(level: int, minXp: int, maxXp: int): void {
    level = Math.min(Math.min(level, 1), XpPointsUtil.MaxPlayerLevel);

    if (level < this.MaxPlayerLevel) {
      minXp = this.Config.XpRequiredPerLevel[level];
      maxXp = this.Config.XpRequiredPerLevel[level + 1];
    } else {
      minXp = this.Config.XpRequiredPerLevel[this.MaxPlayerLevel];
      maxXp = minXp + 1;
    }
  }

  public static GetLevelForXp(xp: int): int {
    for (let i = this.MaxPlayerLevel; i > 0; i--) {
      if (this.Config.XpRequiredPerLevel[i] !== undefined) {
        const num = this.Config.XpRequiredPerLevel[i];
        if (xp >= num) return i;
      }
    }

    return 1;
  }

  public static get MaxPlayerLevel(): int {
    return this.Config.MaxLevel;
  }
}
