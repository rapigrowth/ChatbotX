#!/bin/sh

# --enable-source-maps resolves production stack traces back to original TypeScript source.
export CHATBOTX_MCP_HOST="${CHATBOTX_MCP_HOST:-0.0.0.0}"
export CHATBOTX_MCP_PORT="${CHATBOTX_MCP_PORT:-${PORT:-3333}}"
export NODE_OPTIONS="--no-node-snapshot --enable-source-maps"

node apps/mcp-server/dist/index.mjs
