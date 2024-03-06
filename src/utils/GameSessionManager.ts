import { PublicProfileView } from '@/Cmune/DataCenter/Common/Entities';
import { GameSession } from '@/models';
import { Op } from 'sequelize';

const SESSION_EXPIRE_HOURS: number = 12;

export default class GameSessionManager {
  private Seed: bigint = BigInt(new Date().getTime());

  private static GarbageCollector: NodeJS.Timeout;

  constructor() {
    if (!GameSessionManager.GarbageCollector) {
      GameSessionManager.GarbageCollector = setInterval(() => {
        GameSession.destroy({
          where: {
            ExpireTime: {
              [Op.lte]: new Date(),
            },
          },
        });
      }, 1000 * 60 * 5);
    }
  }

  public async findOrCreateSessionForSteamUser(profile: PublicProfileView, machineId: string, steamMember: any): Promise<any> {
    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + SESSION_EXPIRE_HOURS);

    const [session, isCreated] = await GameSession.findOrCreate({
      where: {
        Cmid: profile.Cmid,
        ExpireTime: {
          [Op.gt]: new Date(),
        },
      },
      defaults: {
        SessionId: this.createSessionIdForSteamUser(profile.Cmid, BigInt(steamMember.SteamId)),
        Cmid: profile.Cmid,
        MachineId: machineId,
        ExpireTime: expireTime,
      },
    });

    if (!isCreated) {
      session.extendExpireTime();
    }

    return session;
  }

  public async findSessionByPlayerId(id: number): Promise<any> {
    const [session, isCreated] = await GameSession.findOrCreate({
      where: {
        Cmid: id,
        ExpireTime: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!isCreated) {
      session.extendExpireTime();
    }

    return session;
  }

  public async findSessionForSteamUser(sessionId: string): Promise<any> {
    return this.findSessionByPlayerId(GameSession.getCmidFromSessionId(sessionId));
  }

  private createSessionIdForSteamUser(cmid: number, steamId: bigint): string {
    const sessionId: Buffer = Buffer.alloc(20);

    const seed = this.Seed;
    this.Seed = (this.Seed + 1n) & 0xFFFFFFFFFFFFFFn;

    sessionId.writeInt32LE(cmid);
    sessionId.writeBigInt64LE(steamId, 4);
    sessionId.writeBigInt64LE(seed, 12);

    return sessionId.toString('base64');
  }
}
