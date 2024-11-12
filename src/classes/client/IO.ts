import consola from "consola";
import { Instance } from "./Instance";
import { MessageSystem } from "./MessageSystem";
import { UdpInstance } from "./UdpInstance";

export class IO {
  static async startCommandLoop() {
    while (true) {
      const commandOrMessage = await consola.prompt("Enter a command or message: ", {
        type: "text"
      });

      if (commandOrMessage.startsWith("/")) {
        const command = commandOrMessage.slice(1).split(" ")[0];

        switch (command) {
          case "devices":
            consola.info("Connected devices:");
            for (const device of Instance.connectedDevices) {
              consola.info(`Hash: ${device.hash}, Address: ${device.address}, Port: ${device.port}`);
            }
            break;
          case "me":
            consola.info(`Instance hash: ${Instance.hash} Address: ${UdpInstance.server.address.address}, Port: ${UdpInstance.server.port}`);
            break;
          case "exit":
            process.exit(0);
          case "direct":
            const hash = commandOrMessage.split(" ")[1];
            const message = commandOrMessage.split(" ").slice(2).join(" ");

            const device = Instance.connectedDevices.find((device) => device.hash === hash);

            if (!device) {
              consola.error("Device not found.");
              break;
            }

            if (!message) {
              consola.error("Message is empty.");
              break;
            }

            MessageSystem.sendMessage({
              type: "message",
              to: "peer",
              data: message,
              from: "peer"
            }, device);
            break;
          case "connect":
            const address = commandOrMessage.split(" ")[1].split(":")[0];
            const port = parseInt(commandOrMessage.split(" ")[1].split(":")[1]);

            if (!address || !port) {
              consola.error("Invalid address or port.");
              break;
            }

            MessageSystem.sendMessage({
              type: "connection_request",
              to: "server",
              data: {
                port: UdpInstance.server.port
              },
              from: "peer"
            }, {
              address,
              port,
              hash: Instance.hash,
              type: "peer"
            });
            break;
          default:
            consola.error("Unknown command.");
            break;
        }
      } else {
        for (const device of Instance.connectedDevices) {

          MessageSystem.sendMessage({
            type: "message",
            to: "peer",
            data: commandOrMessage,
            from: "peer"
          }, device);
        }
      }
    }
  }
}