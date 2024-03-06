import {
  ContactGroupView, ContactRequestStatus, ContactRequestView, MemberOperationResult, PublicProfileView,
} from '@/Cmune/DataCenter/Common/Entities';
import {
  BooleanProxy, ContactGroupViewProxy, ContactRequestViewProxy, EnumProxy, Int32Proxy, ListProxy, PublicProfileViewProxy, StringProxy,
} from '@/UberStrike/Core/Serialization';
import { ContactRequest, PublicProfile } from '@/models';
import { ApiVersion } from '@/utils';
import { Op } from 'sequelize';
import BaseWebService from './BaseWebService';

export default class RelationshipWebService extends BaseWebService {
  public static get ServiceName(): string { return 'RelationshipWebService'; }
  public static get ServiceVersion(): string { return ApiVersion.Current; }
  protected static get ServiceInterface(): string { return 'IRelationshipWebServiceContract'; }

  public static async AcceptContactRequest(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const contactRequestId = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('AcceptContactRequest', authToken, contactRequestId);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const contactRequest = await ContactRequest.findOne({ where: { RequestId: contactRequestId, ReceiverCmid: steamMember.Cmid } });

          if (contactRequest) {
            const initiatorProfile = await PublicProfile.findOne({ where: { Cmid: contactRequest.InitiatorCmid } });
            const receiverProfile = await PublicProfile.findOne({ where: { Cmid: contactRequest.ReceiverCmid } });

            if (initiatorProfile && receiverProfile) {
              await contactRequest.update({
                Status: ContactRequestStatus.Accepted,
              });

              PublicProfileViewProxy.Serialize(outputStream, new PublicProfileView({ ...initiatorProfile.get({ plain: true }) }));
            }
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('AcceptContactRequest', error);
    }
  }

  public static async DeclineContactRequest(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const contactRequestId = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('DeclineContactRequest', authToken, contactRequestId);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const contactRequest = await ContactRequest.findOne({ where: { RequestId: contactRequestId, ReceiverCmid: steamMember.Cmid } });

          if (contactRequest) {
            await contactRequest.update({
              Status: ContactRequestStatus.Refused,
            });

            BooleanProxy.Serialize(outputStream, true);
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('DeclineContactRequest', error);
    }
  }

  public static async DeleteContact(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const contactCmid = Int32Proxy.Deserialize(bytes);

      this.debugEndpoint('DeleteContact', authToken, contactCmid);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          if (await ContactRequest.destroy({
            where: {
              [Op.or]: [{
                ReceiverCmid: steamMember.Cmid,
                InitiatorCmid: contactCmid,
              }, {
                InitiatorCmid: steamMember.Cmid,
                ReceiverCmid: contactCmid,
              }],
              Status: ContactRequestStatus.Accepted,
            },
          })) {
            EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.Ok);
          } else {
            EnumProxy.Serialize<MemberOperationResult>(outputStream, MemberOperationResult.InvalidCmid);
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('DeleteContact', error);
    }
  }

  public static async GetContactRequests(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);

      this.debugEndpoint('GetContactRequests', authToken);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const contactRequests = await ContactRequest.findAll({
            where: {
              ReceiverCmid: steamMember.Cmid,
              Status: ContactRequestStatus.Pending,
            },
          });

          ListProxy.Serialize<ContactRequestView>(outputStream, contactRequests as ContactRequestView[], ContactRequestViewProxy.Serialize);
        }
      }
    } catch (error) {
      this.handleEndpointError('GetContactRequests', error);
    }
  }

  public static async GetContactsByGroups(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const populateFacebookIds = BooleanProxy.Deserialize(bytes);

      this.debugEndpoint('GetContactsByGroups', authToken, populateFacebookIds);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const contactRequests = await ContactRequest.findAll({
            where: {
              [Op.or]: {
                ReceiverCmid: steamMember.Cmid,
                InitiatorCmid: steamMember.Cmid,
              },
              Status: ContactRequestStatus.Accepted,
            },
          });

          const contacts: List<ContactGroupView> = [];

          for (const contactRequest of contactRequests) {
            contacts.push(new ContactGroupView({
              GroupId: steamMember.Cmid,
              Contacts: await PublicProfile.findOne({
                where: {
                  Cmid: (contactRequest.InitiatorCmid !== steamMember.Cmid ? contactRequest.InitiatorCmid : contactRequest.ReceiverCmid),
                },
                raw: true,
              }),
            }));
          }

          ListProxy.Serialize<ContactGroupView>(outputStream, contacts, ContactGroupViewProxy.Serialize);
        }
      }
    } catch (error) {
      this.handleEndpointError('GetContactsByGroups', error);
    }
  }

  public static async SendContactRequest(bytes: byte[], outputStream: byte[]) {
    try {
      const authToken = StringProxy.Deserialize(bytes);
      const receiverCmid = Int32Proxy.Deserialize(bytes);
      const message = StringProxy.Deserialize(bytes);

      this.debugEndpoint('SendContactRequest', authToken, receiverCmid, message);

      const session = await global.SessionManager.findSessionForSteamUser(authToken);
      if (session) {
        const steamMember = await session.SteamMember;

        if (steamMember) {
          const playerProfile = await PublicProfile.findOne({ where: { Cmid: steamMember.Cmid } });
          const contactRequest = await ContactRequest.findOne({
            where: {
              InitiatorCmid: steamMember.Cmid,
              ReceiverCmid: receiverCmid,
            },
          });

          if (!contactRequest) {
            await ContactRequest.create({
              RequestId: Math.randomInt(),
              InitiatorCmid: steamMember.Cmid,
              InitiatorName: playerProfile!.Name,
              InitiatorMessage: message,
              ReceiverCmid: receiverCmid,
              SentDate: new Date(),
            });
          }
        }
      }
    } catch (error) {
      this.handleEndpointError('SendContactRequest', error);
    }
  }
}
