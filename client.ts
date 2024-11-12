import { createConsola, consola } from "consola";
import { hash } from "ohash";
import { networkInterfaces } from "os";
import type { TMessage } from "./src/types/Message";
import type { IDevice } from "./src/types/Device";
import { MessageSystem } from "./src/classes/client/MessageSystem";
import { UdpInstance } from "./src/classes/client/UdpInstance";
import { Instance } from "./src/classes/client/Instance";
import { Client } from "./src/classes/client/Client";
import { IO } from "./src/classes/client/IO";

createConsola({
  defaults: {
    type: "info"
  }
}).wrapConsole();

await Client.init();

consola.info(`Instance hash: ${Instance.hash}`);

console.log(`Server started on port ${UdpInstance.server.port}`);

await IO.startCommandLoop();