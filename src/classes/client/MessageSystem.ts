import type { udp } from "bun";
import consola from "consola";
import type { TMessage } from "../../types/Message";
import type { IDevice } from "../../types/Device";
import { Instance } from "./Instance";
import { UdpInstance } from "./UdpInstance";

export class MessageSystem {
  static sendMessage(message: TMessage, device: IDevice) {
    message.hash ??= Instance.hash;

    if (message.from === "server") console.log(message, device)



    UdpInstance.server.send(JSON.stringify(message), device.port, device.address);
  }

  static parseMessage(buffer: Buffer): TMessage {
    return JSON.parse(buffer.toString());
  }

  static proccessMessage(buffer: Buffer, port: number, address: string) {
    const message = this.parseMessage(buffer);
    let device = Instance.connectedDevices.find((device) => device.hash === message.hash);

    device ??= {
      address,
      port,
      hash: message.hash ?? "",
      type: message.from
    }

    if (message.to === "server") return;

    switch (message.type) {
      case "connection_request":
        // if (message.hash === Instance.hash) return;
        if (Instance.connectedDevices.find((device) => device.hash === message.hash)) return;

        console.log(message);


        Instance.connectedDevices.push({
          hash: message.hash ?? "",
          address,
          port: message.data.port,
          lastAliveTimestamp: Date.now(),
          type: message.from
        });

        consola.info(`Received connection request from ${address}:${port} with hash ${message.hash} and sending response...`);

        this.sendMessage({
          type: "connection_request",
          to: "peer",
          data: {
            port: UdpInstance.server.port
          },
          from: "peer"
        }, device);
        break;
      case "message":
        consola.info(`${message.hash}: ${message.data}`);
        break;
      case "keep_alive":
        device.lastAliveTimestamp = Date.now();
        break;
      default:
        consola.warn(`Unknown message type`);
        break;
    }
  }
}
