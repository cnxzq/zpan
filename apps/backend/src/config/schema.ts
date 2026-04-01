/**
 * Configuration schema for ZPan
 */

/**
 * User role
 */
export type UserRole = 'admin' | 'user';

/**
 * User permission
 */
export type UserPermission = 'read' | 'write';

/**
 * User information
 */
export interface User {
  /** Username (unique identifier) */
  username: string;
  /** Password */
  password: string;
  /** User role */
  role: UserRole;
  /** Permission level */
  permission: UserPermission;
  /** Root directory (relative to admin staticRoot) */
  rootDir: string;
}

export interface ZpanConfig {
  /** Instance name */
  name: string;
  /** Port to listen on */
  port: number;
  /** Host to bind to */
  host: string;
  /** Base URL when deployed under a subpath (e.g. /zpan) */
  baseUrl: string;
  /** Root directory to serve files from */
  staticRoot: string;
  /** Username for authentication (legacy) */
  password: string;
  /** Authentication realm */
  realm: string;
  /** Maximum file size for uploads in bytes */
  maxFileSize: number;
  /** Session secret for cookie encryption */
  sessionSecret: string;
  /** Session cookie name */
  sessionName: string;
  /** Username for authentication (legacy) */
  username: string;
  /** List of users (includes admin) */
  users?: User[];
  /** Config file path (used for saving changes) */
  configPath?: string;
}

export type ZpanConfigInit = Partial<ZpanConfig>;

/**
 * JSON config input (all fields optional)
 */
export type JsonConfig = ZpanConfigInit;
