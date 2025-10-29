import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SaturnClient } from '../saturnClient.js';

export function registerSaturnTools(server: McpServer, client: SaturnClient) {
  // Workspaces
  server.tool(
    'saturn.listWorkspaces',
    'List Saturn Cloud workspaces.',
    { page: z.number().optional(), page_size: z.number().optional(), org_id: z.string().optional(), group_id: z.string().optional(), include_groups: z.boolean().optional() },
    async (args) => {
      const data = await client.get('/api/workspaces', args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.tool(
    'saturn.startWorkspace',
    'Start a workspace by ID. Optionally enable debug mode.',
    { workspace_id: z.string(), debug_mode: z.boolean().optional() },
    async ({ workspace_id, debug_mode }) => {
      const data = await client.post(`/api/workspaces/${workspace_id}/start`, debug_mode ? { debug_mode } : undefined);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.tool(
    'saturn.stopWorkspace',
    'Stop a workspace by ID.',
    { workspace_id: z.string() },
    async ({ workspace_id }) => {
      const data = await client.post(`/api/workspaces/${workspace_id}/stop`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.tool(
    'saturn.workspaceLogs',
    'Fetch workspace logs. Optionally return only the last N lines.',
    { workspace_id: z.string(), tail: z.number().int().positive().optional() },
    async ({ workspace_id, tail }) => {
      const data: any = await client.get(`/api/workspaces/${workspace_id}/logs`);
      let result;
      if (tail) {
        const lines = Array.isArray(data?.lines) ? data.lines.slice(-tail) : [];
        result = { workspace_id, lines };
      } else {
        result = data;
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  // Deployments
  server.tool(
    'saturn.startDeployment',
    'Start a deployment by ID.',
    { deployment_id: z.string() },
    async ({ deployment_id }) => {
      const data = await client.post(`/api/deployments/${deployment_id}/start`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.tool(
    'saturn.stopDeployment',
    'Stop a deployment by ID.',
    { deployment_id: z.string() },
    async ({ deployment_id }) => {
      const data = await client.post(`/api/deployments/${deployment_id}/stop`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.tool(
    'saturn.deploymentLogs',
    'Fetch deployment logs. Optionally return only the last N lines.',
    { deployment_id: z.string(), tail: z.number().int().positive().optional() },
    async ({ deployment_id, tail }) => {
      const data: any = await client.get(`/api/deployments/${deployment_id}/logs`);
      let result;
      if (tail) {
        const lines = Array.isArray(data?.lines) ? data.lines.slice(-tail) : [];
        result = { deployment_id, lines };
      } else {
        result = data;
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  // Jobs
  server.tool(
    'saturn.jobStart',
    'Execute a job now (by deployment_id).',
    { deployment_id: z.string() },
    async ({ deployment_id }) => {
      const data = await client.post(`/api/jobs/${deployment_id}/start`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.tool(
    'saturn.jobSchedule',
    'Create/replace a cron schedule for a job (by deployment_id). Example cron: "0 3 * * *"',
    { deployment_id: z.string(), cron: z.string() },
    async ({ deployment_id, cron }) => {
      const data = await client.post(`/api/jobs/${deployment_id}/schedule`, { schedule: cron });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.tool(
    'saturn.jobUnschedule',
    'Remove the cron schedule for a job (by deployment_id).',
    { deployment_id: z.string() },
    async ({ deployment_id }) => {
      const data = await client.post(`/api/jobs/${deployment_id}/unschedule`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  // Secrets
  server.tool(
    'saturn.listSecrets',
    'List secrets (supports common filters/pagination).',
    { owner_id: z.string().optional(), owner_name: z.string().optional(), user_id: z.string().optional(), group_id: z.string().optional(), org_id: z.string().optional(), page: z.number().optional(), page_size: z.number().optional() },
    async (args) => {
      const data = await client.get('/api/secrets', args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.tool(
    'saturn.createSecret',
    'Create a secret.',
    { owner_id: z.string(), owner_name: z.string().optional(), user_id: z.string().nullable().optional(), group_id: z.string().nullable().optional(), org_id: z.string(), name: z.string(), access: z.enum(['owner', 'org', 'group']), value: z.string() },
    async (args) => {
      const data = await client.post('/api/secrets', args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.tool(
    'saturn.attachSecret',
    'Attach a secret to a resource (workspaces|jobs|deployments).',
    { resource_type: z.enum(['workspaces', 'jobs', 'deployments']), resource_id: z.string(), secret_id: z.string(), description: z.string().optional() },
    async ({ resource_type, resource_id, secret_id, description }) => {
      const data = await client.post(`/api/${resource_type}/${resource_id}/secrets`, { secret: { id: secret_id }, description });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  // Recipes
  server.tool(
    'saturn.upsertRecipe',
    'Create or update a recipe (workspace|deployment|job|image). Provide raw JSON object.',
    { recipe: z.any() },
    async ({ recipe }) => {
      const data = await client.put('/api/recipes', recipe);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.tool(
    'saturn.listRecipes',
    'List recipes (optionally filter by type).',
    { type: z.enum(['workspace', 'deployment', 'job', 'image']).optional() },
    async ({ type }) => {
      const res: any = await client.get('/api/recipes');
      let result;
      if (!type) {
        result = res;
      } else {
        const items = Array.isArray(res?.items) ? res.items.filter((r: any) => r?.type === type) : res;
        result = { items };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.tool(
    'saturn.getRecipe',
    'Get a recipe by type and name.',
    { recipe_type: z.enum(['workspace', 'deployment', 'job', 'image']), name: z.string() },
    async ({ recipe_type, name }) => {
      const data = await client.get(`/api/recipes/${recipe_type}/${encodeURIComponent(name)}`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  // Raw proxy (restricted)
  server.tool(
    'saturn.rawGet',
    'Advanced: GET any /api/* path with optional query. Use carefully.',
    { path: z.string(), query: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional() },
    async ({ path, query }) => {
      if (!path.startsWith('/api/')) throw new Error('path must start with /api/');
      const data = await client.get(path, query as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );

  server.tool(
    'saturn.rawPost',
    'Advanced: POST any /api/* path with JSON body.',
    { path: z.string(), body: z.any().optional() },
    async ({ path, body }) => {
      if (!path.startsWith('/api/')) throw new Error('path must start with /api/');
      const data = await client.post(path, body);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  );
}
