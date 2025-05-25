interface EchoChannel {
  listen(event: string, callback: (e: any) => void): EchoChannel;
  stopListening(event: string): EchoChannel;
}

interface Echo {
  private(channel: string): EchoChannel;
  channel(channel: string): EchoChannel;
  join(channel: string): EchoChannel;
  leave(channel: string): void;
  disconnect(): void;
}

declare global {
  interface Window {
    Echo?: Echo;
  }
}
