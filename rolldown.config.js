import { defineConfig } from 'rolldown';

export default defineConfig([
  {
    input: 'cli.ts',
    output: {
      file: 'dist/cli.js',
      format: 'esm',
      banner: '#!/usr/bin/env node\n',
    },
    external: [
      'path', 'fs', 'os', 'crypto', 'http', 'https',
      'events', 'stream', 'buffer', 'querystring', 'url', 'util',
      'zlib', 'net', 'assert'
    ],
  },
]);
