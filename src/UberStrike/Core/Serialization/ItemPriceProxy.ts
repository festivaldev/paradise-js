import { BuyingDurationType, PackType, UberStrikeCurrencyType } from '@/Cmune/DataCenter/Common/Entities';
import { ItemPrice } from '@/UberStrike/Core/Models/Views';
import EnumProxy from './EnumProxy';
import Int32Proxy from './Int32Proxy';

export default class ItemPriceProxy {
  public static Serialize(stream: byte[], instance: ItemPrice): void {
    const memoryStream: byte[] = [];
    Int32Proxy.Serialize(memoryStream, instance.Amount);
    EnumProxy.Serialize<UberStrikeCurrencyType>(memoryStream, instance.Currency);
    Int32Proxy.Serialize(memoryStream, instance.Discount);
    EnumProxy.Serialize<BuyingDurationType>(memoryStream, instance.Duration);
    EnumProxy.Serialize<PackType>(memoryStream, instance.PackType);
    Int32Proxy.Serialize(memoryStream, instance.Price);
    memoryStream.WriteTo(stream);
  }

  public static Deserialize(bytes: byte[]): ItemPrice {
    return new ItemPrice({
      Amount: Int32Proxy.Deserialize(bytes),
      Currency: EnumProxy.Deserialize<UberStrikeCurrencyType>(bytes),
      Discount: Int32Proxy.Deserialize(bytes),
      Duration: EnumProxy.Deserialize<BuyingDurationType>(bytes),
      PackType: EnumProxy.Deserialize<PackType>(bytes),
      Price: Int32Proxy.Deserialize(bytes),
    });
  }
}
