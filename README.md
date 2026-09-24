# mcp-close-crm

Close CRM MCP Pack — wraps the Close (close.com) API v1.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1679+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `close_me` | Get the current Close user and organization for the supplied API key. Returns user ID, name, email, and the organizations (with IDs) the key can access. Use this to verify the key works and discover your organization context. |
| `close_search_leads` | Search or list leads (companies/accounts in Close) using Close's query language. Returns a `data` array of leads (with id, display_name, contacts, status, custom fields) plus `has_more` and `total_results`. The `query` param accepts Close search syntax, e.g. `name:"Acme"`, `status_label:"Potential"`, `email_address:@example.com`, `lead_created_within:7d`, or free text. Omit `query` to list all leads. Page with `_limit` (max 200) and `_skip`. |
| `close_get_lead` | Get a single lead by its Close lead ID (format `lead_...`). Returns full detail: display name, description, status, contacts, addresses, opportunities, custom fields, and timestamps. |
| `close_list_opportunities` | List opportunities (pipeline deals) in Close. Returns a `data` array of opportunities with id, lead_id, status, value, currency, confidence, and expected close date, plus `has_more` / `total_results`. Pass `lead_id` to scope to one lead, or omit to list across the organization. Page with `_limit` / `_skip`. |
| `close_list_contacts` | List contacts (people) in Close. Returns a `data` array of contacts with id, lead_id, name, title, emails, and phones, plus `has_more` / `total_results`. Optionally filter to one lead with `lead_id`. Page with `_limit` / `_skip`. |
| `close_list_activities` | List activities for a lead — calls, emails, notes, SMS, meetings, and status changes. Returns a `data` array (with id, _type, type, date_created, and type-specific fields) plus `has_more` / `total_results`. Requires `lead_id`. Page with `_limit` / `_skip` to walk a lead's timeline. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "close-crm": {
      "url": "https://gateway.pipeworx.io/close-crm/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/close-crm/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1679+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

This pack takes your own API key (`_apiKey`) — we don't front one for it, so there's no curl here that would run without it. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/close_me`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "close-crm": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-close-crm"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-close-crm
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Close Crm data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
