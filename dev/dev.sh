#!/bin/bash
# Development server startup script
# ark-pan development environment - port 8091

cd "$(dirname "$0")"
node auth-server.js
