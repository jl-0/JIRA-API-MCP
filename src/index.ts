#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { JiraMCPServer } from './server.js';

async function main() {
  const server = new JiraMCPServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('JIRA MCP Server started');
}

main().catch((error) => {
  console.error('Failed to start JIRA MCP Server:', error);
  process.exit(1);
});