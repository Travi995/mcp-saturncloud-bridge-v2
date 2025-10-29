# MCP SaturnCloud Bridge

Control Saturn Cloud from Cursor via MCP.

## Features
- Workspaces: list, start/stop, logs (tail N)
- Deployments: start/stop, logs (tail N)
- Jobs: run now, schedule/unschedule (cron)
- Secrets: list, create, attach to resource
- Recipes: upsert, list, get by type+name
- Local FS: listDir, createFile, readFile, writeFile, createNotebook (.ipynb)
- Raw GET/POST proxies for /api/*

## Quickstart
```bash
npm i
npm run build
SATURN_TOKEN=... npm start
```

Then add it in Cursor (see `cursor.mcp.example.json`).

## Example tool calls (in Cursor)
- "List my Saturn workspaces" → `saturn.listWorkspaces`.
- "Start workspace ws_123 and show last 100 lines" → `saturn.startWorkspace` then `saturn.workspaceLogs{tail:100}`.
- "Schedule nightly run for deploy dpl_abc at 03:00 UTC" → `saturn.jobSchedule {deployment_id:"dpl_abc", cron:"0 3 * * *"}`.
- "Create a secret MY_API_KEY and attach to workspace ws_123" → `saturn.createSecret` then `saturn.attachSecret`.
- "Create Jupyter notebook at notebooks/demo.ipynb" → `fs.createNotebook`.
