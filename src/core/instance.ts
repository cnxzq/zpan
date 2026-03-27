import type { ZpanConfig } from '../config/schema';
import { createServer } from '../server/app';

/**
 * ZPan single instance - encapsulates one running server
 */
export class ZpanInstance {
  public server: ReturnType<typeof createServer>;
  public running = false;
  private httpServer: ReturnType<typeof this.server.listen> | null = null;

  constructor(
    public readonly config: ZpanConfig
  ) {
    this.server = createServer(config);
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer = this.server.listen(this.config.port, this.config.host, () => {
        this.running = true;
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.httpServer) {
        this.running = false;
        resolve();
        return;
      }

      this.httpServer.close((err) => {
        this.running = false;
        this.httpServer = null;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get the listening address
   */
  getAddress(): string {
    if (this.config.baseUrl) {
      return `http://${this.config.host}:${this.config.port}${this.config.baseUrl}`;
    }
    return `http://${this.config.host}:${this.config.port}`;
  }
}
