import type { udp } from "bun";
import { MessageSystem } from "./MessageSystem";
import consola from "consola";


export class UdpInstance {
  static portRange = [50000, 50010]
  static server: udp.Socket<"buffer">
  static dataHooks: ((buffer: Buffer, port: number, address: string) => void)[] = []

  static async init() {
    this.server = await this.openServer().then((server) => {
      if (!server) {
        consola.error("Failed to open server.");
        process.exit(1);
      }
      return server;
    });

    if (!this.server) {
      consola.error("Failed to open server.");
      process.exit(1);
    }
  }

  static async openServer() {
    for (let i = this.portRange[0]; i < this.portRange[1]; i++) {
      try {
        return await Bun.udpSocket({
          port: i,
          socket: {
            data(socket, buffer, port, address) {
              for (const hook of UdpInstance.dataHooks) {
                hook(buffer, port, address);
              }
            }
          }
        });
      } catch (e: any) {
        if (e.message !== "Failed to bind socket") {
          consola.error(e);
        }
      }
    }
  }

  static addDataHook(hook: (buffer: Buffer, port: number, address: string) => void) {
    this.dataHooks.push(hook);
  }
}