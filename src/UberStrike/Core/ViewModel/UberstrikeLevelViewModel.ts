import { MapView } from '@/UberStrike/Core/Models/Views';

export default class UberstrikeLevelViewModel {
  public Maps: List<MapView> = [];

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
