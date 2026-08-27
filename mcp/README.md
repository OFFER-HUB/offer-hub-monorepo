# OFFER-HUB MCP Documentation Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes OFFER-HUB documentation to AI assistants like Claude, ChatGPT, Cursor, and Codex. This allows developers to query the official documentation directly from their AI assistant.

The server is hosted and reachable over MCP's **Streamable HTTP** transport at a stable production URL, so there is no local installation or stdio setup required — the docs site's page-actions menu ("Connect with MCP", "Connect to VSCode", "Connect to Claude Code", "Connect to Codex") wires these up with one click.

## Features

- **search_docs**: Search documentation by query with relevance scoring
- **get_doc_page**: Retrieve full content of a specific documentation page by slug
- **list_doc_sections**: List all available documentation sections and pages

## Hosted endpoint

The recommended way to connect is the hosted server — no clone, build, or absolute-path config needed:

```
https://offer-hub.tech/api/mcp
```

The server is deployed within the main OFFER-HUB Next.js application as a serverless Streamable HTTP endpoint. You can configure your AI assistants to connect to the remote endpoint without running any local servers.

### Connect (one click)

**Generic MCP config (Claude Desktop, Cursor, `.mcp.json`)** — paste into any client that reads the `mcpServers` format:

```json
{
  "mcpServers": {
    "offer-hub-docs": {
      "type": "http",
      "url": "https://offer-hub.tech/api/mcp"
    }
  }
}
```

**VS Code** — click the install deep link (or open it in a browser):

```
vscode:mcp/install?%7B%22name%22%3A%22offer-hub-docs%22%2C%22transportType%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Foffer-hub.tech%2Fapi%2Fmcp%22%7D
```

**Claude Code** — run in your terminal:

```bash
claude mcp add --transport http offer-hub-docs https://offer-hub.tech/api/mcp
```

**Codex** — add to `~/.codex/config.toml` (or a project-scoped `.codex/config.toml`):

```toml
[mcp_servers.offer-hub-docs]
url = "https://offer-hub.tech/api/mcp"
```

> **Note on remote HTTP transport** — since direct HTTP transport configuration depends on the assistant's implementation, refer to your assistant's latest documentation for connecting to a remote MCP URL. Some clients also support provisioning the hosted endpoint via Smithery.

## Installation (local development only)

Running the server locally from source is only needed when you want to develop the server itself. To connect to the docs, prefer the hosted endpoint above.

### Option 1: Run from Source (Recommended for Development)

```bash
# Navigate to the mcp directory
cd mcp

# Install dependencies
npm install

# Build the server
npm run build

# Run the server
npm start
```

### Option 2: Run with npx (After Publishing)

```bash
npx @offer-hub/mcp-docs-server
```

## Configuration

All clients below can use the hosted endpoint (recommended, see [Hosted endpoint](#hosted-endpoint)). The local stdio examples are kept as a development fallback for when you're running the server from source.

### Claude Desktop

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Hosted endpoint:

```json
{
  "mcpServers": {
    "offer-hub-docs": {
      "type": "http",
      "url": "https://offer-hub.tech/api/mcp"
    }
  }
}
```

Local stdio (development fallback):

```json
{
  "mcpServers": {
    "offer-hub-docs": {
      "command": "node",
      "args": ["/absolute/path/to/offer-hub/mcp/build/index.js"]
    }
  }
}
```

Or with npx (after publishing):

```json
{
  "mcpServers": {
    "offer-hub-docs": {
      "command": "npx",
      "args": ["-y", "@offer-hub/mcp-docs-server"]
    }
  }
}
```

### Claude Code (CLI)

Hosted endpoint (one command):

```bash
claude mcp add --transport http offer-hub-docs https://offer-hub.tech/api/mcp
```

Local stdio (development fallback) — add to your `~/.claude.json` or project's `.mcp.json`:

```json
{
  "mcpServers": {
    "offer-hub-docs": {
      "command": "node",
      "args": ["/absolute/path/to/offer-hub/mcp/build/index.js"]
    }
  }
}
```

### Cursor

Add to your Cursor MCP configuration.

Hosted endpoint:

```json
{
  "mcpServers": {
    "offer-hub-docs": {
      "type": "http",
      "url": "https://offer-hub.tech/api/mcp"
    }
  }
}
```

Local stdio (development fallback):

```json
{
  "mcpServers": {
    "offer-hub-docs": {
      "command": "node",
      "args": ["/absolute/path/to/offer-hub/mcp/build/index.js"]
    }
  }
}
```

### VS Code

Click the [one-click install deep link](#connect-one-click), or add to your workspace `.vscode/mcp.json`:

```json
{
  "servers": {
    "offer-hub-docs": {
      "type": "http",
      "url": "https://offer-hub.tech/api/mcp"
    }
  }
}
```

Local stdio (development fallback):

```json
{
  "servers": {
    "offer-hub-docs": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp/build/index.js"]
    }
  }
}
```

### Codex

Add to `~/.codex/config.toml` (or a project-scoped `.codex/config.toml`):

```toml
[mcp_servers.offer-hub-docs]
url = "https://offer-hub.tech/api/mcp"
```

## Usage Examples

Once configured, you can ask your AI assistant questions like:

- "Search OFFER-HUB docs for escrow implementation"
- "Get the documentation page for deposits"
- "List all available documentation sections"
- "How does the balance system work in OFFER-HUB?"
- "Show me the API reference for webhooks"

## Tools Reference

### list_doc_sections

Lists all available documentation sections with their pages.

**Parameters**: None

**Returns**: Array of sections with their pages

```json
[
  {
    "name": "Getting Started",
    "slug": "getting-started",
    "pages": [
      {
        "title": "Installation",
        "slug": "installation",
        "description": "How to install and set up OFFER-HUB"
      }
    ]
  }
]
```

### search_docs

Search documentation by query.

**Parameters**:
- `query` (string, required): Search query
- `maxResults` (number, optional): Maximum results to return (default: 10)

**Returns**: Array of matching documents with scores

```json
[
  {
    "title": "Escrow",
    "slug": "docs/guides/escrow",
    "description": "Smart contract mechanics",
    "section": "Guides",
    "snippet": "...USDC locked in a Soroban smart contract via Trustless Work...",
    "score": 15
  }
]
```

### get_doc_page

Get full content of a specific documentation page.

**Parameters**:
- `slug` (string, required): The slug/path of the documentation page

**Returns**: Full document content

```json
{
  "title": "Getting Started",
  "description": "Learn how OFFER-HUB works",
  "section": "Getting Started",
  "slug": "getting-started",
  "content": "# Getting Started\n\nOFFER-HUB is a non-custodial escrow..."
}
```

## Documentation Sources

The server indexes documentation from two locations:

1. **`content/docs/`** - MDX files for the documentation website
2. **`docs/`** - Markdown files with technical guides and references

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Run the server
npm start
```

## Requirements

- Node.js >= 18.0.0
- The server must be run from within the OFFER-HUB repository (or have access to the docs directories)

## License

MIT