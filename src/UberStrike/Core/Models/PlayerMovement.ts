import ShortVector3 from './ShortVector3';

export default class PlayerMovement {
  public Number: byte;
  public Position: ShortVector3;
  public Velocity: ShortVector3;
  public HorizontalRotation: byte;
  public VerticalRotation: byte;
  public KeyState: byte;
  public MovementState: byte;

  constructor(params: any = {}) {
    for (const key of Object.keys(params)) {
      if (key in this) {
        this[key] = params[key];
      }
    }
  }
}
