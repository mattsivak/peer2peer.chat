import { hash } from "ohash";
import { Instance } from "./Instance";
import { UdpInstance } from "./UdpInstance";
import { networkInterfaces } from "os";
import { MessageSystem } from "./MessageSystem";
import consola from "consola";

export class Client {
  static async init() {
    await UdpInstance.init();
    Instance.hash = hash({
      timestamp: Date.now(),
      port: UdpInstance.server.port,
      address: UdpInstance.server.address,
    })

    UdpInstance.addDataHook((buffer, port, address) => {
      MessageSystem.proccessMessage(buffer, port, address);
    });

    this.loop();
  }

  static loop() {
    this.sendConnectionRequests();
    this.checkAndSendKeepAlive();

    setTimeout(() => this.loop(), 1000);
  }

  static interfaces = networkInterfaces();

  static sendConnectionRequests() {
    for (const name in this.interfaces) {
      const iface = this.interfaces[name];

      if (!iface) continue;

      const addresses = iface.filter((addr) => addr.family === "IPv4" && !addr.internal);

      for (const addr of addresses) {
        for (let i = 0; i < 255; i++) {
          for (let port = UdpInstance.portRange[0]; port < UdpInstance.portRange[1]; port++) {
            try {
              const address = addr.address.split(".").slice(0, 3).join(".") + `.${i}`;

              MessageSystem.sendMessage({
                type: "connection_request",
                to: "peer",
                data: {
                  port: UdpInstance.server.port
                },
                from: "peer"
              }, {
                address,
                port,
                hash: "",
                type: "peer"
              });
            } catch (e) {
              // console.error(e);
            }
          }
        }
      }
    }
  }

  static checkAndSendKeepAlive() {
    for (const device of Instance.connectedDevices) {
      if (Date.now() - (device.lastAliveTimestamp ?? Date.now()) > 5000) {
        consola.info(`Device ${device.address}:${device.port} is not alive. Removing...`);
        Instance.connectedDevices.splice(Instance.connectedDevices.indexOf(device), 1);
        continue;
      }
      MessageSystem.sendMessage({
        to: "peer",
        type: "keep_alive",
        from: "peer"
      }, device);

    }
  }


}