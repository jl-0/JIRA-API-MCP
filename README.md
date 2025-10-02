# JIRA MCP Server

A Model Context Protocol (MCP) server that provides read-only access to JIRA REST API, enabling LLMs to query and retrieve information from JIRA instances.

## Features

### Issue Operations
- **Search Issues** - Execute JQL queries to find issues
- **Get Issue Details** - Retrieve comprehensive information about specific issues
- **Get Issue Comments** - Fetch comments for issues
- **Get Issue Transitions** - View available workflow transitions

### Project Operations
- **List Projects** - Get all accessible projects
- **Get Project Details** - Retrieve detailed project information
- **Search Projects** - Find projects by various criteria

### User Operations
- **Get Current User** - Retrieve authenticated user information
- **Get User** - Get details about specific users
- **Search Users** - Find users by query

### Field Discovery Operations
- **Get Issue Types** - Get all issue types for a project
- **Get Issue Type Fields** - Get all fields available for a specific issue type
- **Get Issue Field Names** - Get all field IDs and names for a specific issue
- **Search Issue Fields** - Search for fields by name in a specific issue with partial matching

## Architecture

This MCP server follows a modular architecture designed for maintainability and extensibility:

### Project Structure

```
JIRA-API-MCP/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── server.ts             # Server initialization and tool registration
│   ├── client/
│   │   ├── JiraClient.ts     # JIRA API client wrapper with axios
│   │   └── types.ts          # TypeScript interfaces for JIRA data models
│   ├── tools/
│   │   ├── issues.ts         # Issue-related MCP tool implementations
│   │   ├── projects.ts       # Project-related MCP tool implementations
│   │   ├── users.ts          # User-related MCP tool implementations
│   │   └── fields.ts         # Field discovery MCP tool implementations
│   └── __tests__/
│       ├── tools-direct.test.ts    # Integration tests for tool handlers
│       ├── jira.test.ts           # Direct JIRA API tests
│       └── generate-mcp-docs.ts   # Documentation generation utility
├── dist/                     # Compiled JavaScript output
├── __tool_response_logs__/   # Test response captures
└── docs/
    ├── CLAUDE.md            # Instructions for AI assistants
    ├── INSPECTOR_GUIDE.md   # MCP Inspector usage guide
    ├── MCP_TOOL_DOCUMENTATION.md  # Detailed tool specifications
    └── TEST_SUMMARY.md      # Testing documentation
```

### Key Components

1. **MCP Server Layer** (`server.ts`)
   - Implements Model Context Protocol specification
   - Registers all available tools with the MCP SDK
   - Handles tool dispatch and response formatting

2. **JIRA Client** (`client/JiraClient.ts`)
   - Axios-based HTTP client for JIRA REST API v2
   - Handles authentication via Bearer tokens
   - Implements retry logic and error handling
   - Manages request/response transformations

3. **Tool Modules** (`tools/*.ts`)
   - Each module exports tool definitions with:
     - Zod schemas for input validation
     - Handler functions that call the JIRA client
     - Consistent error handling and response formatting
   - Tools return standardized `{success, data/error}` structure

4. **Type System** (`client/types.ts`)
   - Comprehensive TypeScript interfaces for JIRA entities
   - Ensures type safety across the application
   - Documents expected data structures

### Data Flow

1. **Request Flow:**
   ```
   MCP Client → MCP Server → Tool Handler → JIRA Client → JIRA API
   ```

2. **Response Flow:**
   ```
   JIRA API → JIRA Client → Tool Handler → MCP Server → MCP Client
   ```

### Design Principles

- **Modularity**: Each tool is self-contained with its own validation and logic
- **Type Safety**: Full TypeScript coverage with strict typing
- **Error Resilience**: Graceful error handling at each layer
- **Testability**: Comprehensive test suite with response capture
- **Documentation**: Auto-generated docs from actual API responses

## Installation

### From NPM

```bash
npm install @mcp/jira-server
```

### From Source

```bash
git clone https://github.com/jl-0/JIRA-API-MCP.git
cd JIRA-API-MCP
npm install
npm run build
```

## Configuration

The server requires JIRA authentication credentials. You can provide these via environment variables or a `.env` file:

```bash
# Required
# For Server/Data Center: https://your-server.com/jira
# For Cloud: https://your-domain.atlassian.net (not currently supported)
JIRA_BASE_URL=https://your-server.com/jira

# For Server/Data Center: Personal Access Token (PAT)
JIRA_API_TOKEN=your-personal-access-token

# Optional
JIRA_MAX_RESULTS=50  # Default max results per request
JIRA_TIMEOUT=30000   # Request timeout in milliseconds
```

### JIRA Server/Data Center Support

This MCP server is designed for **JIRA Server and Data Center** installations using:
- **REST API v2** endpoints
- **Personal Access Token (PAT)** authentication with Bearer tokens
- Compatible with JIRA Server 8.14+ and JIRA Service Management 4.15+

### Getting a Personal Access Token (PAT)

#### For JIRA Server/Data Center:
1. Log in to your JIRA instance
2. Navigate to your Profile → Personal Access Tokens
3. Click "Create token"
4. Give it a descriptive name and set expiration
5. Copy the token immediately (it won't be shown again)
6. Use this token as `JIRA_API_TOKEN` in your configuration

The server uses Bearer token authentication: `Authorization: Bearer <token>`

**Note:** JIRA Cloud uses a different authentication mechanism (API tokens with Basic auth) which is not currently supported by this server.

## Usage

### With Claude Desktop

Add the server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["@jl-0/jira-server"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### As a Standalone Server

```bash
# Using environment variables
export JIRA_BASE_URL=https://your-domain.atlassian.net
export JIRA_API_TOKEN=your-api-token
npm start

# Or using a .env file
npm start
```

## Testing & Development

### Interactive Testing with MCP Inspector

The MCP Inspector provides an interactive web interface for testing all server capabilities:

```bash
# Launch inspector with TypeScript source (development)
npm run inspect

# Build and inspect with compiled JavaScript
npm run inspect:built
```

The inspector will open at `http://localhost:6274` and allow you to:
- Test all available tools with custom parameters
- View real-time server responses
- Debug authentication and connectivity issues
- Monitor server logs and notifications

See [INSPECTOR_GUIDE.md](./INSPECTOR_GUIDE.md) for detailed usage instructions.

### Automated Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run direct tool integration tests
npm run test:direct

# Generate documentation from test responses
npm run test:generate-docs
```

Test outputs are saved to `__tool_response_logs__/` for analysis.

See [TEST_SUMMARY.md](./TEST_SUMMARY.md) for test documentation.

## Available Tools

### jira_search_issues
Search for issues using JQL (JIRA Query Language).

**Parameters:**
- `jql` (required): JQL query string
- `maxResults`: Maximum results to return (default: 50)
- `fields`: Array of fields to include
- `expand`: Array of data to expand
- `startAt`: Starting index for pagination

**Example:**
```json
{
  "jql": "project = PROJ AND status = 'In Progress'",
  "maxResults": 10
}
```

### jira_get_issue
Get detailed information about a specific issue.

**Parameters:**
- `issueIdOrKey` (required): Issue ID or key (e.g., PROJ-123)
- `fields`: Array of fields to include
- `expand`: Array of data to expand

### jira_get_issue_comments
Get comments for a specific issue.

**Parameters:**
- `issueIdOrKey` (required): Issue ID or key
- `maxResults`: Maximum results (default: 50)
- `startAt`: Starting index for pagination

### jira_get_issue_transitions
Get available transitions for an issue.

**Parameters:**
- `issueIdOrKey` (required): Issue ID or key
- `includeUnavailable`: Include unavailable transitions (default: false)

### jira_list_projects
List all accessible projects.

**Parameters:**
- `expand`: Array of additional data to expand
- `recent`: Return only most recent projects

### jira_get_project
Get detailed project information.

**Parameters:**
- `projectIdOrKey` (required): Project ID or key
- `expand`: Array of additional data to expand

### jira_search_projects
Search for projects.

**Parameters:**
- `query`: Search query string
- `maxResults`: Maximum results (default: 50)
- `startAt`: Starting index
- `orderBy`: Sort order field
- `typeKey`: Project type key
- `categoryId`: Project category ID
- `action`: Filter by permission (view/browse/edit)

### jira_get_current_user
Get information about the authenticated user.

**Parameters:**
- `expand`: Additional data to expand

### jira_search_users
Search for users.

**Parameters:**
- `query`: Search query matching display name and email
- `accountId`: Find user by account ID
- `maxResults`: Maximum results (default: 50)
- `startAt`: Starting index

### jira_get_issue_types
Get all issue types available for a specific project.

**Parameters:**
- `projectIdOrKey` (required): Project ID or key
- `maxResults`: Maximum results (default: 50)
- `startAt`: Starting index

### jira_get_issue_type_fields
Get all fields available for a specific issue type in a project.

**Parameters:**
- `projectIdOrKey` (required): Project ID or key
- `issueTypeId` (required): Issue type ID
- `maxResults`: Maximum results (default: 50)
- `startAt`: Starting index

### jira_get_issue_field_names
Get all field IDs and names for a specific JIRA issue.

**Parameters:**
- `issueIdOrKey` (required): Issue ID or key

**Example:**
```json
{
  "issueIdOrKey": "IDS-10314"
}
```

### jira_search_issue_fields
Search for specific fields by name in a JIRA issue.

**Parameters:**
- `issueIdOrKey` (required): Issue ID or key
- `searchTerms` (required): Array of search terms to match against field names

**Example:**
```json
{
  "issueIdOrKey": "IDS-10314",
  "searchTerms": ["test", "procedure", "story points"]
}
```

## JQL Examples

Common JQL queries you can use with `jira_search_issues`:

```sql
-- Find all open issues assigned to me
assignee = currentUser() AND resolution = Unresolved

-- Find high priority bugs
priority = High AND issuetype = Bug

-- Issues updated in the last week
updated >= -1w

-- Issues in specific projects
project in (PROJ1, PROJ2) AND status = "To Do"

-- Issues with specific labels
labels in ("backend", "api")

-- Issues created this month
created >= startOfMonth()

-- Find issues by reporter
reporter = "john.doe@example.com"

-- Complex query
project = PROJ AND (
  (priority = High AND status = "In Progress") OR
  (priority = Critical AND status != Done)
) ORDER BY created DESC
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Publishing to npm

### First-time Setup

1. Ensure you have an npm account at [npmjs.com](https://www.npmjs.com/)
2. Login to npm from your terminal:
   ```bash
   npm login
   ```

### Publishing Process

1. Update the version in `package.json` following semantic versioning:
   ```bash
   npm version patch  # for bug fixes (0.1.0 -> 0.1.1)
   npm version minor  # for new features (0.1.0 -> 0.2.0)
   npm version major  # for breaking changes (0.1.0 -> 1.0.0)
   ```

2. Build the project:
   ```bash
   npm run clean
   npm run build
   ```

3. Test locally (optional but recommended):
   ```bash
   npm link
   # In another project:
   npm link @mcp/jira-server
   ```

4. Publish to npm:
   ```bash
   npm publish --access public
   ```

5. Create a git tag and push:
   ```bash
   git push origin main
   git push origin --tags
   ```

### Package Information

- **Package Name:** @mcp/jira-server
- **Author:** Jeff Leach
- **Repository:** [https://github.com/jl-0/JIRA-API-MCP](https://github.com/jl-0/JIRA-API-MCP)
- **License:** MIT

## Error Handling

The server provides detailed error messages for common issues:

- **Authentication failures** - Check your API token and email
- **Permission errors** - Ensure your account has access to the requested resources
- **Rate limiting** - The server implements retry logic for rate limits
- **Network issues** - Check your internet connection and JIRA instance URL

## Security

- API tokens are never logged or exposed
- All communication with JIRA uses HTTPS
- Uses Bearer token authentication for secure API access
- Credentials should be stored securely using environment variables
- The server provides read-only access by default

## Limitations

- This is a read-only implementation (no issue creation/updates)
- Rate limits are determined by your JIRA instance
- Some JIRA Cloud features may not be available on JIRA Server/Data Center
- Field discovery tools use the editmeta endpoint which returns fields available for editing

## Future Enhancements

Planned features for future releases:

- Issue creation and updates
- Attachment handling
- Webhook support
- Advanced filtering and field customization
- Bulk operations
- Sprint and board operations (JIRA Software)
- Service desk operations (JIRA Service Management)

## Documentation

This project maintains comprehensive documentation:

- **[CLAUDE.md](./CLAUDE.md)** - Instructions for AI assistants working with this codebase
- **[INSPECTOR_GUIDE.md](./INSPECTOR_GUIDE.md)** - Detailed guide for using MCP Inspector
- **[MCP_TOOL_DOCUMENTATION.md](./MCP_TOOL_DOCUMENTATION.md)** - Complete tool specifications and examples
- **[TEST_SUMMARY.md](./TEST_SUMMARY.md)** - Testing approach and coverage
- **[SCRIPTS_REFERENCE.md](./SCRIPTS_REFERENCE.md)** - NPM scripts quick reference

### Documentation Maintenance

When making changes to the codebase:

1. **Update README.md** when adding features or changing configuration
2. **Run tests** to capture new response formats: `npm run test:direct`
3. **Generate documentation** from test outputs: `npm run test:generate-docs`
4. **Update tool documentation** if parameters or responses change
5. **Follow guidelines** in CLAUDE.md for consistent documentation

## Contributing

Contributions are welcome! Please:

1. Read [CLAUDE.md](./CLAUDE.md) for development guidelines
2. Update documentation when making changes
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Run linting: `npm run lint`
6. Submit a Pull Request with clear description

## License

MIT

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/jl-0/JIRA-API-MCP/issues) page.