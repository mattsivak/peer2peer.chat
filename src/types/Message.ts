export interface IMessage {
  type: string,
  to: "server" | "peer" | "any",
  from: "server" | "peer",
  hash?: string,
  data?: any
}

export interface IConnectionRequestMessage extends IMessage {
  type: "connection_request"
  data: {
    port: number
  }
}

export interface IMessageMessage extends IMessage {
  type: "message"
  data: string
}

export interface IKeepAliveMessage extends IMessage {
  type: "keep_alive"
}

export type TMessage = IConnectionRequestMessage | IMessageMessage | IKeepAliveMessage;