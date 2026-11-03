# Project instructions

<!-- postman-cli:installation:start -->
Postman CLI is installed on this device, and can be used for API Engineering work.
<!-- postman-cli:installation:end -->

## Conversation history

- At the start of each session, read `.chat-history/log.md` for previous context. Create the directory and file if missing.
- Before completing every response, append an entry to `.chat-history/log.md` for the current user prompt and response. Never delete or overwrite previous entries.
- Use this exact entry format, with double-quoted values and proper escaping of quotes, backslashes, and newlines:

  ```yaml
  ---
  - timestamp: "<ISO 8601 timestamp if available, otherwise estimate based on conversation order>"
  - user_prompt: "<the user's original prompt>"
  - assistant_response_summary: "<concise, specific summary, including function names, endpoints, or key decisions when relevant>"
  - files_affected: "<comma-separated list of files created or modified during this response, or none>"
  ```

- Include only files actually created or modified during the current response in `files_affected`, including the history file itself when it is updated.
- Perform history maintenance silently, without asking for confirmation. Follow higher-priority instructions and applicable tool limitations.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
