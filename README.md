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

## Installation

### From NPM

```bash
npm install @mcp/jira-server
```

### From Source

```bash
git clone https://github.com/yourusername/jira-mcp-server.git
cd jira-mcp-server
npm install
npm run build
```

## Configuration

The server requires JIRA authentication credentials. You can provide these via environment variables or a `.env` file:

```bash
# Required
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token

# Optional
JIRA_MAX_RESULTS=50  # Default max results per request
JIRA_TIMEOUT=30000   # Request timeout in milliseconds
```

### Getting a JIRA API Token

1. Log in to your JIRA account
2. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
3. Click "Create API token"
4. Give it a descriptive name
5. Copy the token and store it securely

## Usage

### With Claude Desktop

Add the server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["@mcp/jira-server"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
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
export JIRA_EMAIL=your-email@example.com
export JIRA_API_TOKEN=your-api-token
npm start

# Or using a .env file
npm start
```

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

## Error Handling

The server provides detailed error messages for common issues:

- **Authentication failures** - Check your API token and email
- **Permission errors** - Ensure your account has access to the requested resources
- **Rate limiting** - The server implements retry logic for rate limits
- **Network issues** - Check your internet connection and JIRA instance URL

## Security

- API tokens are never logged or exposed
- All communication with JIRA uses HTTPS
- Credentials should be stored securely using environment variables
- The server provides read-only access by default

## Limitations

- This is a read-only implementation (no issue creation/updates)
- Rate limits are determined by your JIRA instance
- Some JIRA Cloud features may not be available on JIRA Server/Data Center
- Custom fields are returned but not specially handled

## Future Enhancements

Planned features for future releases:

- Issue creation and updates
- Attachment handling
- Webhook support
- Advanced filtering and field customization
- Bulk operations
- Custom field management
- Sprint and board operations (JIRA Software)
- Service desk operations (JIRA Service Management)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/yourusername/jira-mcp-server/issues) page.