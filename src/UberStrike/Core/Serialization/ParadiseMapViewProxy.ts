import { ParadiseMapView } from '@/UberStrike/Core/Models/Views';
import MapViewProxy from './MapViewProxy';
import StringProxy from './StringProxy';

export default class ParadiseMapViewProxy {
  public static Serialize(stream: byte[], instance: ParadiseMapView): void {
    const memoryStream: byte[] = [];
    MapViewProxy.Serialize(memoryStream, instance);
    StringProxy.Serialize(memoryStream, instance.FileName);
    memoryStream.WriteTo(stream);
  }

  public static Deserialize(bytes: byte[]): ParadiseMapView {
    const mapView = MapViewProxy.Deserialize(bytes) as ParadiseMapView;
    mapView.FileName = StringProxy.Deserialize(bytes);

    return mapView;
  }
}
