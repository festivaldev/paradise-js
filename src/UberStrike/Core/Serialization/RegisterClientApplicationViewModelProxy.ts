import { ApplicationRegistrationResult } from '@/Cmune/DataCenter/Common/Entities';
import { RegisterClientApplicationViewModel } from '@/UberStrike/Core/ViewModel';
import EnumProxy from './EnumProxy';
import Int32Proxy from './Int32Proxy';
import ListProxy from './ListProxy';

export default class RegisterClientApplicationViewModelProxy {
  public static Serialize(stream: byte[], instance: RegisterClientApplicationViewModel): void {
    let num = 0;

    const memoryStream: byte[] = [];
    if (instance.ItemsAttributed) {
      ListProxy.Serialize<int>(memoryStream, instance.ItemsAttributed, Int32Proxy.Serialize);
    } else {
      num |= 1;
    }

    EnumProxy.Serialize<ApplicationRegistrationResult>(memoryStream, instance.Result);
    Int32Proxy.Serialize(stream, ~num);
    memoryStream.WriteTo(stream);
  }

  public static Deserialize(bytes: byte[]): RegisterClientApplicationViewModel {
    const num = Int32Proxy.Deserialize(bytes);
    const registerClientApplicationViewModel = new RegisterClientApplicationViewModel();

    if ((num & 1) !== 0) {
      registerClientApplicationViewModel.ItemsAttributed = ListProxy.Deserialize<int>(bytes, Int32Proxy.Deserialize);
    }

    registerClientApplicationViewModel.Result = EnumProxy.Deserialize<ApplicationRegistrationResult>(bytes);

    return registerClientApplicationViewModel;
  }
}
