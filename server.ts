import { createConsola } from "consola";
import { UdpInstance } from "./src/classes/client/UdpInstance";
import { MessageSystem } from "./src/classes/client/MessageSystem";
import { Instance } from "./src/classes/client/Instance";

createConsola({
  defaults: {
    type: "info"
  }
}).wrapConsole();

await UdpInstance.init()

console.log(`Server started on  ${UdpInstance.server.address.address}:${UdpInstance.server.port}`)

UdpInstance.addDataHook((buffer, port, address) => {
  const message = MessageSystem.parseMessage(buffer);
  let device = Instance.connectedDevices.find((device) => device.hash === message.hash);

  device ??= {
    address,
    port,
    hash: message.hash ?? "",
    type: message.from
  }

  if (message.to === "peer") return;

  switch (message.type) {
    case "connection_request":
      if (message.hash === Instance.hash) return;
      if (Instance.connectedDevices.find((device) => device.hash === message.hash)) return;

      Instance.connectedDevices.push(device);

      console.log(`Received connection request from ${address}:${port} with hash ${message.hash} and sending response...`);

      MessageSystem.sendMessage({
        type: "connection_request",
        to: "peer",
        from: "server",
        data: {
          port: UdpInstance.server.port
        }
      }, device);
      break;
    case "message":
      console.log(`${message.hash}: ${message.data}`);
      break;
    case "keep_alive":
      device.lastAliveTimestamp = Date.now();
      break;
    default:
      console.warn(`Unknown message type`);
      break;
  }
})