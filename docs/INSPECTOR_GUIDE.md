# JIRA MCP Server - Inspector Guide

This guide explains how to use the MCP Inspector to test and debug the JIRA MCP server interactively.

## Quick Start

### Using NPM Scripts

The easiest way to launch the inspector is using the provided npm scripts:

```bash
# Inspect using TypeScript source (development mode)
npm run inspect

# Build and inspect using compiled JavaScript
npm run inspect:built
```

### Manual Launch

You can also launch the inspector manually:

```bash
# Using TypeScript source
npx @modelcontextprotocol/inspector tsx src/index.ts

# Using compiled JavaScript (after building)
npm run build
npx @modelcontextprotocol/inspector node dist/index.js

# From NPM package (if published)
npx -y @modelcontextprotocol/inspector npx @jl-0/jira-mcp-server
```

## Environment Setup

Before running the inspector, ensure your `.env` file is configured:

```bash
JIRA_BASE_URL=https://your-jira-instance.atlassian.net
JIRA_API_TOKEN=your-api-token-here
JIRA_TIMEOUT=30000
```

## Using the Inspector

**⚠️ IMPORTANT: JSON FORMAT REQUIREMENTS**
All parameters must be valid JSON with proper quotes! See [INSPECTOR_JSON_FORMAT.md](./INSPECTOR_JSON_FORMAT.md) for detailed examples.
- String values MUST have double quotes: `"IDS-10194"` not `IDS-10194`
- The entire input must be a JSON object: `{ "key": "value" }`

### 1. Initial Connection

When the inspector opens in your browser:

1. The server will automatically connect using stdio transport
2. Check the connection status in the top-left corner
3. Verify that the server capabilities are displayed

### 2. Testing Tools

Navigate to the **Tools** tab to test JIRA operations:

#### Testing Issue Search

1. Select `jira_search_issues` from the tools list
2. Enter parameters in the JSON editor:
```json
{
  "jql": "project = IDS AND status = Open",
  "maxResults": 10,
  "fields": ["key", "summary", "status", "assignee"]
}
```
3. Click "Run Tool" to execute
4. View the response in the output pane

#### Testing Get Issue

1. Select `jira_get_issue`
2. Enter parameters (**Remember: String values need quotes!**):
```json
{
  "issueIdOrKey": "IDS-10194",
  "fields": ["summary", "description", "status", "assignee", "reporter"]
}
```
3. Run and observe the detailed issue data

#### Testing Comments

1. Select `jira_get_issue_comments`
2. Enter parameters:
```json
{
  "issueIdOrKey": "IDS-10194",
  "maxResults": 5,
  "startAt": 0
}
```
3. View the comments in the response

### 3. Testing Projects

#### List Projects
```json
{
  "recent": 5,
  "expand": ["description", "lead"]
}
```

#### Get Specific Project
```json
{
  "projectIdOrKey": "IDS",
  "expand": ["description", "lead", "issueTypes"]
}
```

### 4. Testing User Operations

#### Get Current User
```json
{
  "expand": "groups"
}
```

#### Search Users
```json
{
  "query": "john",
  "maxResults": 10
}
```

### 5. Monitoring Server Output

The **Notifications** pane shows:
- Server logs and debug information
- Error messages
- Connection status changes

## Common Testing Scenarios

### 1. Verify Authentication

Test the `jira_get_current_user` tool with no parameters to verify your credentials are working:

```json
{}
```

Expected: Returns your JIRA user information

### 2. Test Error Handling

Try an invalid issue key:

```json
{
  "issueIdOrKey": "INVALID-99999"
}
```

Expected: Returns error response with `success: false`

### 3. Test Pagination

Search with pagination:

```json
{
  "jql": "project = IDS",
  "maxResults": 5,
  "startAt": 0
}
```

Then:
```json
{
  "jql": "project = IDS",
  "maxResults": 5,
  "startAt": 5
}
```

### 4. Test Field Filtering

Get issue with minimal fields:

```json
{
  "issueIdOrKey": "IDS-10194",
  "fields": ["key", "summary"]
}
```

Then with all fields:
```json
{
  "issueIdOrKey": "IDS-10194"
}
```

## Debugging Tips

### 1. Check Server Logs

Monitor the terminal where you launched the inspector for server-side logs.

### 2. Response Structure

All tools return this structure:
```typescript
{
  success: boolean,
  data?: any,    // Present when success is true
  error?: string // Present when success is false
}
```

### 3. Common Issues

**"Required" Parameter Errors**
```json
{
  "success": false,
  "error": "Invalid arguments",
  "details": [{
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["issueIdOrKey"],
    "message": "Required"
  }]
}
```
- This means you forgot to provide a required parameter
- For `jira_get_issue`, `jira_get_issue_comments`, and `jira_get_issue_transitions`: you MUST provide `issueIdOrKey`
- For `jira_search_issues`: you MUST provide `jql`
- Check the tool's input schema for required vs optional parameters

**404 Errors on Search**
- The server might be using the wrong API version
- Check if `/rest/api/2/` vs `/rest/api/3/` is correct for your JIRA instance

**Authentication Failures**
- Verify your API token is valid
- Check the JIRA_BASE_URL doesn't have trailing slashes
- Ensure the token has appropriate permissions

**Timeout Issues**
- Increase JIRA_TIMEOUT in your .env file
- Check network connectivity to JIRA

### 4. Testing Complex JQL

Build JQL queries incrementally:

1. Start simple: `project = IDS`
2. Add conditions: `project = IDS AND status = Open`
3. Add text search: `project = IDS AND text ~ "search term"`
4. Add date ranges: `project = IDS AND created >= -7d`

## Advanced Usage

### Custom Environment Variables

You can pass environment variables when launching:

```bash
JIRA_BASE_URL=https://different-instance.atlassian.net \
JIRA_API_TOKEN=different-token \
npm run inspect
```

### Testing with Different Configurations

Create multiple `.env` files:

```bash
# .env.production
JIRA_BASE_URL=https://production.atlassian.net
JIRA_API_TOKEN=prod-token

# .env.staging
JIRA_BASE_URL=https://staging.atlassian.net
JIRA_API_TOKEN=staging-token
```

Then run:
```bash
cp .env.staging .env && npm run inspect
```

### Debugging Network Issues

Enable axios debugging by modifying the JiraClient:

```typescript
// In src/client/JiraClient.ts
this.client.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  return request;
});
```

## Integration with Tests

After testing in the inspector, you can add the successful test cases to the automated test suite:

1. Copy the working parameters from the inspector
2. Add to `src/__tests__/tools-direct.test.ts`
3. Run `npm test:direct` to verify

## Troubleshooting

### Inspector Won't Start

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Server Crashes on Start

Check for:
1. Missing environment variables
2. Invalid JIRA URL format
3. TypeScript compilation errors

Run build first:
```bash
npm run build
```

### Can't Connect to JIRA

1. Test API token directly:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/json" \
     https://your-instance.atlassian.net/rest/api/2/myself
```

2. Check firewall/proxy settings
3. Verify JIRA instance is accessible

## Next Steps

1. Use the inspector to explore all available tools
2. Test edge cases and error scenarios
3. Document any issues found
4. Update tests based on inspector findings
5. Consider adding new tools based on testing needs

## Related Documentation

- [MCP Inspector Repository](https://github.com/modelcontextprotocol/inspector)
- [MCP Debugging Guide](https://modelcontextprotocol.io/docs/debugging)
- [JIRA REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v2/)
- [Test Documentation](./TEST_SUMMARY.md)
- [Tool Documentation](./MCP_TOOL_DOCUMENTATION.md)