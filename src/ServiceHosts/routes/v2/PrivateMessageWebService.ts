import { MessageThreadView, PrivateMessageView } from '@/Cmune/DataCenter/Common/Entities';
import {
  BooleanProxy, Int32Proxy, ListProxy, MessageThreadViewProxy, PrivateMessageViewProxy, StringProxy,
} from '@/UberStrike/Core/Serialization';
import { PrivateMessage, PublicProfile } from '@/models';
import { ApiVersion } from '@/utils';
import { Op } from 'sequelize';
import BaseWebService from './BaseWebService';

export default class PrivateMessageWebService extends BaseWebService {
  public static get ServiceName(): string { return 'PrivateMessageWebService'; }
  public static get ServiceVersion(): string { return ApiVersion.Current; }
  protected static get ServiceInterface(): string { return 'IPrivateMessageWebServiceContract'; }

  static async DeleteThread(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const otherCmid = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('DeleteThread', authToken, otherCmid);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const messages = await PrivateMessage.findAll({
            where: {
              [Op.or]: [{
                FromCmid: steamMember.Cmid,
                ToCmid: otherCmid,
              }, {
                FromCmid: otherCmid,
                ToCmid: steamMember.Cmid,
              }],
            },
          });

          for (const message of messages) {
            if (message.FromCmid === steamMember.cmid) {
              await message.update({ IsDeletedBySender: true });
            } else {
              await message.update({ IsDeletedByReceiver: true });
            }
          }

          BooleanProxy.Serialize(outputStream, true);
        }
      }
    } catch (error) {
      this.handleEndpointError('DeleteThread', error);
    }
  }

  static async GetAllMessageThreadsForUser(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const pageNumber = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('GetAllMessageThreadsForUser', authToken, pageNumber);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const messages = (await PrivateMessage.findAll({
            where: {
              [Op.or]: {
                FromCmid: steamMember.Cmid,
                ToCmid: steamMember.Cmid,
              },
            },
          })).reduce((acc, curr) => {
            const threadId = [curr.FromCmid, curr.ToCmid].sort().join(',');

            if (!acc[threadId]) {
              acc[threadId] = [];
            }

            acc[threadId].push(curr);
            return acc;
          }, {});

          const threads: List<MessageThreadView> = [];

          for (const messageGroup of Object.values(messages)) {
            const filteredMessages = (messageGroup as any).find((_) => (_.FromCmid === steamMember.Cmid && !_.IsDeletedBySender) || (_.ToCmid === steamMember.Cmid && !_.IsDeletedByReceiver));

            if (filteredMessages.length) {
              const message = filteredMessages[filteredMessages.length - 1];

              const otherCmid = message.FromCmid !== steamMember.Cmid ? message.FromCmid : message.ToCmid;
              const otherProfile = await PublicProfile.findOne({ where: { Cmid: otherCmid } });

              if (otherProfile) {
                threads.push(new MessageThreadView({
                  ThreadId: otherCmid,
                  ThreadName: otherProfile.Name,
                  MessageCount: filteredMessages.length,
                  LastMessagePreview: message.ContentText,
                  LastUpdate: message.DateSent,
                  HasNewMessages: filteredMessages.some((_) => _.ToCmid === steamMember.Cmid && !_.IsRead),
                }));
              }
            }
          }

          ListProxy.Serialize<MessageThreadView>(outputStream, threads, MessageThreadViewProxy.Serialize);
        }
      }
    } catch (error) {
      this.handleEndpointError('GetAllMessageThreadsForUser', error);
    }
  }

  static async GetMessageWithIdForCmid(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const messageId = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('GetMessageWithIdForCmid', authToken, messageId);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const message = await PrivateMessage.findOne({
            where: {
              PrivateMessageId: messageId,
              [Op.or]: [{
                FromCmid: steamMember.Cmid,
                IsDeletedBySender: false,
              }, {
                ToCmid: steamMember.Cmid,
                IsDeletedByReceiver: false,
              }],
            },
          });

          if (message) {
            PrivateMessageViewProxy.Serialize(outputStream, new PrivateMessageView({ ...message.get({ plain: true }) }));
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('GetMessageWithIdForCmid', error);
    }
  }

  static async GetThreadMessages(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const otherCmid = Int32Proxy.Deserialize(bytes);
      const pageNumber = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('GetThreadMessages', authToken, otherCmid, pageNumber);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const messages = await PrivateMessage.findAll({
            where: {
              [Op.or]: [{
                FromCmid: steamMember.Cmid,
                ToCmid: otherCmid,
                IsDeletedBySender: false,
              }, {
                FromCmid: otherCmid,
                ToCmid: steamMember.Cmid,
                IsDeletedByReceiver: false,
              }],
            },
          });

          ListProxy.Serialize<PrivateMessageView>(outputStream, messages as PrivateMessageView[], PrivateMessageViewProxy.Serialize);
        }
      }
    } catch (error) {
      this.handleEndpointError('GetThreadMessages', error);
    }
  }

  static async MarkThreadAsRead(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const otherCmid = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('MarkThreadAsRead', authToken, otherCmid);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const messages = await PrivateMessage.findAll({
            where: {
              ToCmid: steamMember.Cmid,
              FromCmid: otherCmid,
              IsRead: false,
            },
          });

          for (const message of messages) {
            message.update({
              IsRead: true,
            });
          }

          BooleanProxy.Serialize(outputStream, true);
        }
      }
    } catch (error) {
      this.handleEndpointError('MarkThreadAsRead', error);
    }
  }

  static async SendMessage(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const receiverCmid = Int32Proxy.Deserialize(bytes);
      const content = StringProxy.Deserialize(bytes);

      this.debugEndpoint('SendMessage', authToken, receiverCmid, content);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const sender = await PublicProfile.findOne({ where: { Cmid: steamMember.Cmid } });
          const receiver = await PublicProfile.findOne({ where: { Cmid: receiverCmid } });

          if (sender && receiver) {
            const privateMessage = await PrivateMessage.create({
              PrivateMessageId: Math.randomInt(),
              FromCmid: sender.Cmid,
              FromName: sender.Name,
              ToCmid: receiver.Cmid,
              DateSent: new Date(),
              ContentText: content,
              IsRead: false,
            });

            PrivateMessageViewProxy.Serialize(outputStream, new PrivateMessageView({ ...privateMessage }));
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('SendMessage', error);
    }
  }
}
