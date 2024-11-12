import type { IDevice } from "../../types/Device";

export class Instance {
  static hash: string = "";
  static connectedDevices: IDevice[] = [];
}