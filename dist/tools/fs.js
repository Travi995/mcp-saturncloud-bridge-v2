import { z } from 'zod';
import { promises as fs } from 'fs';
import * as path from 'path';
export function registerFsTools(server) {
    server.tool('fs.listDir', 'List directory entries (files and folders).', { dir: z.string() }, async ({ dir }) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(entries.map((e) => ({ name: e.name, type: e.isDirectory() ? 'dir' : 'file' })), null, 2)
                }
            ]
        };
    });
    server.tool('fs.createFile', 'Create a text/binary file. Set overwrite=true to replace.', { file: z.string(), content: z.string().default(''), overwrite: z.boolean().default(false) }, async ({ file, content, overwrite }) => {
        const exists = await existsAsync(file);
        if (exists && !overwrite)
            throw new Error('File exists. Set overwrite=true to replace.');
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file, content);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ ok: true, file }, null, 2)
                }
            ]
        };
    });
    server.tool('fs.readFile', 'Read a file. Optionally limit bytes.', { file: z.string(), maxBytes: z.number().int().positive().optional() }, async ({ file, maxBytes }) => {
        const buf = await fs.readFile(file);
        const out = maxBytes ? buf.subarray(0, maxBytes) : buf;
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ file, content: out.toString('utf-8') }, null, 2)
                }
            ]
        };
    });
    server.tool('fs.writeFile', 'Write or append to a file.', { file: z.string(), content: z.string(), append: z.boolean().default(false) }, async ({ file, content, append }) => {
        await fs.mkdir(path.dirname(file), { recursive: true });
        if (append)
            await fs.appendFile(file, content);
        else
            await fs.writeFile(file, content);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ ok: true, file }, null, 2)
                }
            ]
        };
    });
    server.tool('fs.createNotebook', 'Create a minimal Jupyter .ipynb notebook at path.', { file: z.string(), title: z.string().default('Notebook'), code: z.string().default('print("hello from MCP")') }, async ({ file, title, code }) => {
        const nb = {
            cells: [
                { cell_type: 'markdown', metadata: {}, source: [`# ${title}\n`] },
                { cell_type: 'code', metadata: {}, source: [code + '\n'], outputs: [], execution_count: null },
            ],
            metadata: { kernelspec: { name: 'python3', display_name: 'Python 3' }, language_info: { name: 'python' } },
            nbformat: 4,
            nbformat_minor: 5,
        };
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file, JSON.stringify(nb, null, 2));
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ ok: true, file }, null, 2)
                }
            ]
        };
    });
}
async function existsAsync(p) {
    try {
        await fs.stat(p);
        return true;
    }
    catch {
        return false;
    }
}
