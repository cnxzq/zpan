import { ZpanInstance } from './instance';
import type { ZpanConfig } from '../config/schema';

/**
 * Instance Manager - manages multiple ZPan instances in the same process
 */
export class InstanceManager {
  private instances = new Map<string, ZpanInstance>();

  /**
   * Create a new instance
   */
  create(config: ZpanConfig): ZpanInstance {
    const instance = new ZpanInstance(config);
    this.instances.set(config.name, instance);
    return instance;
  }

  /**
   * Get an instance by name
   */
  get(name: string): ZpanInstance | undefined {
    return this.instances.get(name);
  }

  /**
   * List all instances
   */
  list(): ZpanInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Remove an instance
   */
  async remove(name: string): Promise<boolean> {
    const instance = this.instances.get(name);
    if (!instance) {
      return false;
    }

    await instance.stop();
    this.instances.delete(name);
    return true;
  }

  /**
   * Stop all instances
   */
  async stopAll(): Promise<void> {
    const promises = Array.from(this.instances.values()).map(instance =>
      instance.stop()
    );
    await Promise.all(promises);
    this.instances.clear();
  }
}
