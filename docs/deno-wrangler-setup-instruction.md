# Instructions for Setting Up Deno & Wrangler Environment for Cloudflare Workers

## AI Assistant Instructions

**IMPORTANT: Read and follow these instructions carefully before proceeding with
any tasks.**

When working with this project, you MUST:

1. **Follow the exact step-by-step sequence** outlined in this document without
   skipping or reordering steps.
2. **Execute all commands exactly as specified** - do not modify paths, flags,
   or parameters unless explicitly instructed.
3. **Create all required files** with the exact content provided in the code
   blocks.
4. **Use the correct file names and locations** as specified in each step.
5. **Replace placeholder values** (like `YYYY-MM-DD`, `your-project-name`) with
   appropriate actual values when creating configuration files.
6. **Stop at Step 7** - DO NOT execute the commands in Step 8 (dev/deploy)
   unless the user explicitly requests it.
7. **Verify each step completes successfully** before moving to the next step.
8. **Use Deno-specific commands and conventions** - this is a Deno project, not
   Node.js.
9. **Maintain the exact project structure** shown in the Project Structure
   section.

**Do NOT:**

- Skip any steps or assume they're already complete
- Use alternative commands or tools not specified in the instructions
- Modify the configuration files beyond what's specified
- Execute deployment or development server commands without user request
- Mix Node.js and Deno conventions

**Behavior:**

- If a step fails, report the error and stop - do not proceed to subsequent
  steps
- If a file already exists, inform the user before overwriting
- When replacing placeholder values, use contextually appropriate values (e.g.,
  current date for compatibility_date)
- Provide clear confirmation after completing each major step

---

This guide provides step-by-step instructions for creating a Cloudflare Workers
project using Deno and Wrangler, ready for deployment.

## Prerequisites

- Deno installed on your system
- A Cloudflare account for deployment

## Step 1: Initialize Deno Configuration

Create a `deno.json` file in your project root with the following configuration:

```json
{
  "compilerOptions": {
    "lib": ["ESNext", "deno.window"]
  },
  "tasks": {
    "build": "deno -RWE --allow-run build.ts",
    "cf-typegen": "wrangler types",
    "deploy": "wrangler deploy",
    "dev": "deno serve src/mod.ts",
    "dev-wrangler": "wrangler dev"
  }
}
```

## Step 2: Install Requirements

Add requirements using Deno:

```bash
deno add npm:wrangler npm:esbuild jsr:@deno/esbuild-plugin
```

## Step 3: Create Wrangler Configuration

Create a `wrangler.jsonc` file with the following structure:

```jsonc
{
  "$schema": "https://unpkg.com/wrangler/config-schema.json",
  "name": "your-project-name",
  "main": "dist/server.js",
  "compatibility_date": "YYYY-MM-DD",
  "observability": {
    "enabled": true
  },
  "build": {
    "command": "deno task build"
  }
}
```

**Notes:**

- Replace `YYYY-MM-DD` with today's date (use `date +%Y-%m-%d` command to get
  the current date)

## Step 4: Generate Cloudflare Type Definitions

Run the following command to generate TypeScript type definitions for Cloudflare
Workers:

```bash
deno task cf-typegen
```

This will create a `worker-configuration.d.ts` file that provides automatic type
inference.

## Step 5: Create the Worker Entry Point

Create `src/mod.ts` with a basic worker implementation:

```typescript
export default {
  async fetch(request, env, ctx): Promise<Response> {
    return new Response("Hello, World!");
  },
} satisfies ExportedHandler<Env>;
```

This uses the `ExportedHandler<Env>` type with the `satisfies` keyword for
improved type checking.

## Step 6: Create Build Script

Create a `build.ts` file in your project root to handle building with esbuild:

```typescript
import * as esbuild from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

await esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: ["./src/mod.ts"],
  outfile: "./dist/mod.js",
  bundle: true,
  format: "esm",
  minify: true,
  treeShaking: true,
});

esbuild.stop();
```

This will create the bundled output in `dist/mod.js`.

## Step 7: Build and Format the Code

Build the worker to ensure build succeeds. Run Deno's formatter to ensure code
quality and consistent style:

```bash
deno task build

deno fmt
```

## Step 8: Next Steps for the User

**Important** Do not execute these commands. After completing the setup, inform
the user about these next steps.

Once the setup is complete, suggest the user to:

1. **Test locally** - Start the development server to test the worker:
   ```bash
   deno task dev
   ```
   This will launch Wrangler's local development server where they can test the
   worker.

2. **Deploy to production** - When ready, deploy the worker to Cloudflare:
   ```bash
   deno task deploy
   ```
   This will publish the worker to Cloudflare's network.

## Project Structure

Your final project structure should look like:

```
.
├── deno.json
├── wrangler.jsonc
├── build.ts
├── worker-configuration.d.ts (generated)
├── src/
│   └── mod.ts
└── dist/
    └── mod.js (generated)
```
