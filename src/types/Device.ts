export interface IDevice {
  hash: string,
  name?: string,
  type: "peer" | "server" | "unknown",
  lastAliveTimestamp?: number,
  address: string,
  port: number
}