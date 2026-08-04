# mcp-close-crm

Close CRM MCP Pack — wraps the Close (close.com) API v1.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Close Crm data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
