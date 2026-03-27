/**
 * Configuration schema for ZPan
 */
export interface ZpanConfig {
  /** Instance name */
  name: string;
  /** Port to listen on */
  port: number;
  /** Host to bind to */
  host: string;
  /** Root directory to serve files from */
  staticRoot: string;
  /** Username for authentication */
  username: string;
  /** Password for authentication */
  password: string;
  /** Authentication realm */
  realm: string;
  /** Maximum file size for uploads in bytes */
  maxFileSize: number;
  /** Session secret for cookie encryption */
  sessionSecret: string;
  /** Session cookie name */
  sessionName: string;
}

/**
 * JSON config input (all fields optional)
 */
export type JsonConfig = Partial<ZpanConfig>;
