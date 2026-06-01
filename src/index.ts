interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Close CRM MCP Pack — wraps the Close (close.com) API v1.
 *
 * BYO key: pass _apiKey (your Close API key, found under Settings → API Keys).
 * Auth: HTTP Basic with the API key as the username and an empty password
 *   (Authorization: 'Basic ' + btoa(apiKey + ':')).
 * Tools: me, search_leads, get_lead, list_opportunities, list_contacts, list_activities.
 *
 * List endpoints wrap results under `data` with `has_more` / `total_results`.
 * Pagination uses `_limit` / `_skip` query params.
 */


const API = 'https://api.close.com/api/v1';
const UA = 'pipeworx-mcp-close-crm/1.0 (+https://pipeworx.io)';

function headers(apiKey: string): Record<string, string> {
  return {
    // HTTP Basic: API key as username, empty password.
    Authorization: 'Basic ' + btoa(apiKey + ':'),
    'User-Agent': UA,
    Accept: 'application/json',
  };
}

async function closeGet(apiKey: string, path: string, params?: URLSearchParams): Promise<unknown> {
  const qs = params?.toString();
  const url = `${API}${path}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: headers(apiKey) });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Close: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

// Shared pagination params used by the list-style tools.
function paginate(args: Record<string, unknown>, params: URLSearchParams): void {
  if (args._limit != null) params.set('_limit', String(Math.min(200, Number(args._limit))));
  if (args._skip != null) params.set('_skip', String(Number(args._skip)));
}

// -- Tool definitions --------------------------------------------------------

const tools: McpToolExport['tools'] = [
  {
    name: 'close_me',
    description:
      'Get the current Close user and organization for the supplied API key. Returns user ID, name, email, and the organizations (with IDs) the key can access. Use this to verify the key works and discover your organization context.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Close API key (Settings → API Keys)' },
      },
      required: ['_apiKey'],
    },
  },
  {
    name: 'close_search_leads',
    description:
      "Search or list leads (companies/accounts in Close) using Close's query language. " +
      'Returns a `data` array of leads (with id, display_name, contacts, status, custom fields) plus `has_more` and `total_results`. ' +
      'The `query` param accepts Close search syntax, e.g. `name:"Acme"`, `status_label:"Potential"`, `email_address:@example.com`, ' +
      '`lead_created_within:7d`, or free text. Omit `query` to list all leads. Page with `_limit` (max 200) and `_skip`.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Close API key' },
        query: {
          type: 'string',
          description:
            'Close query string. Examples: `name:"Acme Inc"`, `status_label:"Potential"`, `email_address:@acme.com`, `lead_created_within:30d`. Free text also works. Omit to list all leads.',
        },
        _limit: { type: 'number', description: 'Results per page (default 100, max 200)' },
        _skip: { type: 'number', description: 'Number of results to skip for pagination (default 0)' },
      },
      required: ['_apiKey'],
    },
  },
  {
    name: 'close_get_lead',
    description:
      'Get a single lead by its Close lead ID (format `lead_...`). Returns full detail: display name, description, status, contacts, addresses, opportunities, custom fields, and timestamps.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Close API key' },
        lead_id: { type: 'string', description: 'Close lead ID, e.g. `lead_abc123`' },
      },
      required: ['_apiKey', 'lead_id'],
    },
  },
  {
    name: 'close_list_opportunities',
    description:
      'List opportunities (pipeline deals) in Close. Returns a `data` array of opportunities with id, lead_id, status, value, currency, confidence, and expected close date, plus `has_more` / `total_results`. ' +
      'Pass `lead_id` to scope to one lead, or omit to list across the organization. Page with `_limit` / `_skip`.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Close API key' },
        lead_id: { type: 'string', description: 'Optional lead ID to filter opportunities to a single lead' },
        _limit: { type: 'number', description: 'Results per page (default 100, max 200)' },
        _skip: { type: 'number', description: 'Number of results to skip for pagination (default 0)' },
      },
      required: ['_apiKey'],
    },
  },
  {
    name: 'close_list_contacts',
    description:
      'List contacts (people) in Close. Returns a `data` array of contacts with id, lead_id, name, title, emails, and phones, plus `has_more` / `total_results`. ' +
      'Optionally filter to one lead with `lead_id`. Page with `_limit` / `_skip`.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Close API key' },
        lead_id: { type: 'string', description: 'Optional lead ID to filter contacts to a single lead' },
        _limit: { type: 'number', description: 'Results per page (default 100, max 200)' },
        _skip: { type: 'number', description: 'Number of results to skip for pagination (default 0)' },
      },
      required: ['_apiKey'],
    },
  },
  {
    name: 'close_list_activities',
    description:
      'List activities for a lead — calls, emails, notes, SMS, meetings, and status changes. Returns a `data` array (with id, _type, type, date_created, and type-specific fields) plus `has_more` / `total_results`. ' +
      'Requires `lead_id`. Page with `_limit` / `_skip` to walk a lead\'s timeline.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        _apiKey: { type: 'string', description: 'Close API key' },
        lead_id: { type: 'string', description: 'Lead ID whose activity timeline to fetch' },
        _limit: { type: 'number', description: 'Results per page (default 100, max 200)' },
        _skip: { type: 'number', description: 'Number of results to skip for pagination (default 0)' },
      },
      required: ['_apiKey', 'lead_id'],
    },
  },
];

// -- callTool dispatcher -----------------------------------------------------

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = args._apiKey as string | undefined;
  delete args._context;
  delete args._apiKey;

  if (!apiKey) throw new Error('_apiKey is required for Close API access (your Close API key, sent via HTTP Basic auth)');

  switch (name) {
    case 'close_me':
      return closeGet(apiKey, '/me/');

    case 'close_search_leads': {
      const params = new URLSearchParams();
      if (args.query) params.set('query', String(args.query));
      paginate(args, params);
      return closeGet(apiKey, '/lead/', params);
    }

    case 'close_get_lead':
      return closeGet(apiKey, `/lead/${encodeURIComponent(args.lead_id as string)}/`);

    case 'close_list_opportunities': {
      const params = new URLSearchParams();
      if (args.lead_id) params.set('lead_id', String(args.lead_id));
      paginate(args, params);
      return closeGet(apiKey, '/opportunity/', params);
    }

    case 'close_list_contacts': {
      const params = new URLSearchParams();
      if (args.lead_id) params.set('lead_id', String(args.lead_id));
      paginate(args, params);
      return closeGet(apiKey, '/contact/', params);
    }

    case 'close_list_activities': {
      const params = new URLSearchParams();
      params.set('lead_id', String(args.lead_id));
      paginate(args, params);
      return closeGet(apiKey, '/activity/', params);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
