# OFFER-HUB MCP Documentation Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes OFFER-HUB documentation to AI assistants like Claude, ChatGPT, and Cursor. This allows developers to query the official documentation directly from their AI assistant.

## Features

- **search_docs**: Search documentation by query with relevance scoring
- **get_doc_page**: Retrieve full content of a specific documentation page by slug
- **list_doc_sections**: List all available documentation sections and pages

## Installation & Usage

### Recommended: Hosted HTTP Transport

This MCP server is deployed within the main OFFER-HUB Next.js application as a serverless endpoint. You can configure your AI assistants to connect to the remote endpoint without running any local servers.

#### Using Smithery / Hosted HTTP (Streamable HTTP)

To connect via the remote HTTP endpoint in Claude Desktop, Cursor, or similar tools, you can use the MCP HTTP transport or Smithery CLI if supported.
Since direct HTTP transport configuration depends on the assistant's implementation, refer to their latest documentation for connecting to a remote MCP URL.
The production endpoint is accessible at:
`https://offer-hub.tech/api/mcp`

### Fallback: Local stdio Transport (For Development)

If you prefer to run the server locally over stdio (the standard local MCP method):

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

### Claude Desktop (Local stdio)

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

### Claude Code (CLI) (Local stdio)

Add to your `~/.claude.json` or project's `.mcp.json`:

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

### Cursor (Local stdio)

Add to your Cursor MCP configuration:

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

### VS Code with Claude Extension (Local stdio)

Add to your workspace `.vscode/mcp.json`:

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
