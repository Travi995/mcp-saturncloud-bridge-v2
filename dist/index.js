import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SaturnClient } from './saturnClient.js';
import { registerSaturnTools } from './tools/saturn.js';
import { registerFsTools } from './tools/fs.js';
const SATURN_TOKEN = process.env.SATURN_TOKEN || '';
const SATURN_BASE_URL = process.env.SATURN_BASE_URL || 'https://api.saturncloud.io';
if (!SATURN_TOKEN) {
    console.error('[mcp-saturn] Missing SATURN_TOKEN env var.');
}
const client = new SaturnClient({ token: SATURN_TOKEN, baseUrl: SATURN_BASE_URL });
const server = new McpServer({ name: 'mcp-saturncloud-bridge', version: '0.1.0' }, {
    capabilities: {
        tools: {},
    },
});
registerSaturnTools(server, client);
registerFsTools(server);
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('[mcp-saturn] MCP server ready on stdio');
