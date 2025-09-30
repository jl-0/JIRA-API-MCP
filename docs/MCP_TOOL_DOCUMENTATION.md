# JIRA MCP Server - Tool Documentation

This documentation describes the actual response format for each MCP tool based on real test outputs.

## Response Structure

All JIRA MCP tools return responses in the following format:

### Success Response
```typescript
{
  success: true,
  data: { /* tool-specific data */ }
}
```

### Error Response
```typescript
{
  success: false,
  error: string
}
```

## Issue Tools

### jira_search_issues

Search for JIRA issues using JQL (JIRA Query Language).

**Parameters:**
- `jql` (string, required): JQL query string (e.g., "project = IDS", "text ~ VICAR")
- `maxResults` (number, optional): Maximum results to return (default: 50, max: 100). **IMPORTANT: Must be a number, not a string**
- `fields` (array<string>, optional): Fields to include in response
- `expand` (array<string>, optional): Additional data to expand
- `startAt` (number, optional): Starting index for pagination (default: 0). **IMPORTANT: Must be a number, not a string**

**Success Response:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "isLast": true,
    "nextPageToken": null,
    "issues": [
      {
        "key": "IDS-123",
        "id": "12345",
        "summary": "Issue summary",
        "status": "Open",
        "priority": "High",
        "assignee": "John Doe",
        "reporter": "Jane Smith",
        "created": "2025-01-01T10:00:00.000-0800",
        "updated": "2025-01-02T14:30:00.000-0800",
        "project": "IDS",
        "issueType": "Task",
        "labels": ["label1", "label2"],
        "components": ["Component A"]
      }
    ]
  }
}
```

### jira_get_issue

Get detailed information about a specific JIRA issue.

**Parameters:**
- `issueIdOrKey` (string, required): Issue ID or key (e.g., "IDS-10194")
- `fields` (array<string>, optional): Specific fields to return
- `expand` (array<string>, optional): Additional data to expand

**Success Response:**
```json
{
  "success": true,
  "data": {
    "key": "IDS-10194",
    "id": "1183508",
    "summary": "Issue summary",
    "description": "Detailed description",
    "status": {
      "name": "Open",
      "category": "To Do"
    },
    "priority": {
      "name": "Moderate",
      "id": "6"
    },
    "assignee": {
      "displayName": "Aaron Plave",
      "email": "Aaron.Plave@jpl.nasa.gov"
    },
    "reporter": {
      "displayName": "Jeff Leach",
      "email": "Jeffrey.D.Leach@jpl.nasa.gov"
    },
    "project": {},
    "issueType": {},
    "customFields": {}
  }
}
```

### jira_get_issue_comments

Get all comments for a specific JIRA issue.

**Parameters:**
- `issueIdOrKey` (string, required): Issue ID or key
- `maxResults` (number, optional): Maximum comments to return (default: 50). **IMPORTANT: Must be a number, not a string**
- `startAt` (number, optional): Starting index for pagination (default: 0). **IMPORTANT: Must be a number, not a string**

**Success Response:**
```json
{
  "success": true,
  "data": {
    "total": 4,
    "startAt": 0,
    "maxResults": 5,
    "comments": [
      {
        "id": "1957109",
        "author": "Aaron Plave",
        "body": "Comment text",
        "created": "2025-03-10T11:23:49.000-0700",
        "updated": "2025-03-10T11:23:49.000-0700",
        "updateAuthor": "Aaron Plave"
      }
    ]
  }
}
```

### jira_get_issue_transitions

Get available workflow transitions for a JIRA issue.

**Parameters:**
- `issueIdOrKey` (string, required): Issue ID or key
- `includeUnavailable` (boolean, optional): Include unavailable transitions (default: false)

**Success Response:**
```json
{
  "success": true,
  "data": {
    "transitions": [
      {
        "id": "11",
        "name": "Move to In Progress",
        "to": {
          "id": "3",
          "name": "In Progress",
          "statusCategory": "In Progress"
        },
        "isAvailable": true
      }
    ]
  }
}
```

## Project Tools

### jira_list_projects

List all JIRA projects accessible to the authenticated user.

**Parameters:**
- `recent` (number, optional): Return only N most recent projects. **IMPORTANT: Must be a number, not a string**
- `expand` (array<string>, optional): Additional data to expand

**Success Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "projects": [
      {
        "key": "IDS",
        "id": "10469",
        "name": "IDS",
        "projectTypeKey": "software",
        "isPrivate": false,
        "avatarUrls": {
          "48x48": "https://jira.jpl.nasa.gov/secure/projectavatar?pid=10469",
          "24x24": "https://jira.jpl.nasa.gov/secure/projectavatar?size=small&pid=10469"
        }
      }
    ]
  }
}
```

### jira_get_project

Get detailed information about a specific JIRA project.

**Parameters:**
- `projectIdOrKey` (string, required): Project ID or key (e.g., "IDS")
- `expand` (array<string>, optional): Additional data to expand

**Success Response:**
```json
{
  "success": true,
  "data": {
    "key": "IDS",
    "id": "10469",
    "name": "IDS",
    "description": "Project description",
    "lead": {
      "displayName": "Paul M Ramirez"
    },
    "projectTypeKey": "software",
    "isPrivate": false,
    "avatarUrls": {},
    "category": {
      "id": "10070",
      "name": "MGSS"
    },
    "components": [
      {
        "id": "12411",
        "name": "Component Name",
        "description": "Component description"
      }
    ],
    "versions": []
  }
}
```

### jira_search_projects

Search for JIRA projects based on criteria.

**Parameters:**
- `query` (string, optional): Search query string
- `maxResults` (number, optional): Maximum results (default: 50). **IMPORTANT: Must be a number, not a string**
- `startAt` (number, optional): Starting index (default: 0). **IMPORTANT: Must be a number, not a string**
- `orderBy` (string, optional): Sort order ("name", "key", etc.)
- `action` (string, optional): Permission filter ("view", "browse", "edit")
- `categoryId` (number, optional): Project category ID. **IMPORTANT: Must be a number, not a string**
- `typeKey` (string, optional): Project type key

**Success Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "projects": [/* array of project objects */]
  }
}
```

## User Tools

### jira_get_current_user

Get information about the currently authenticated JIRA user.

**Parameters:**
- `expand` (string, optional): Additional data to expand (e.g., "groups,applicationRoles")

**Success Response:**
```json
{
  "success": true,
  "data": {
    "displayName": "Jeff Leach",
    "emailAddress": "Jeffrey.D.Leach@jpl.nasa.gov",
    "active": true,
    "timeZone": "America/Chicago",
    "avatarUrls": {
      "48x48": "https://jira.jpl.nasa.gov/secure/useravatar?ownerId=jleach",
      "24x24": "https://jira.jpl.nasa.gov/secure/useravatar?size=small&ownerId=jleach"
    }
  }
}
```

### jira_get_user

Get information about a specific JIRA user.

**Parameters:**
- `accountId` (string, required): User's account ID
- `expand` (string, optional): Additional data to expand

**Success Response:**
```json
{
  "success": true,
  "data": {
    "displayName": "User Name",
    "emailAddress": "user@example.com",
    "active": true,
    "timeZone": "America/Los_Angeles"
  }
}
```

### jira_search_users

Search for JIRA users by query string.

**Parameters:**
- `query` (string, optional): Search query matching display name and email
- `accountId` (string, optional): Find user by account ID
- `maxResults` (number, optional): Maximum results (default: 50). **IMPORTANT: Must be a number, not a string**
- `startAt` (number, optional): Starting index (default: 0). **IMPORTANT: Must be a number, not a string**

**Success Response:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "users": [
      {
        "displayName": "User Name",
        "emailAddress": "user@example.com",
        "active": true
      }
    ]
  }
}
```

## Error Handling

All tools return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

Common error messages:
- "JIRA API Error: 404" - Resource not found
- "Issue Does Not Exist" - Invalid issue key
- "No project could be found with key 'X'" - Invalid project key
- "The username query parameter was not provided" - Missing required parameter
- JQL syntax errors for malformed queries

## Usage Notes

1. **Authentication**: All tools require valid JIRA credentials configured in the MCP server
2. **Pagination**: Use `startAt` and `maxResults` for paginating large result sets
3. **Field Selection**: Use the `fields` parameter to limit response size and improve performance
4. **Expand Options**: Use carefully as some expand options significantly increase response size
5. **Error Handling**: Always check the `success` field before accessing `data`

## Example Usage in Claude

When using these tools through Claude's MCP integration:

```typescript
// Search for issues
const response = await mcp__jira__jira_search_issues({
  jql: "project = IDS AND status = Open",
  maxResults: 10,
  fields: ["key", "summary", "status"]
});

if (response.success) {
  console.log(`Found ${response.data.total} issues`);
  response.data.issues.forEach(issue => {
    console.log(`${issue.key}: ${issue.summary}`);
  });
} else {
  console.error(`Error: ${response.error}`);
}
```

## Known Limitations

1. **Search Issues**: The `/rest/api/3/search` endpoint may return 404 on some JIRA instances - use `/rest/api/2/search` instead
2. **Project Search**: The search endpoint may not be available on all JIRA instances
3. **User Search**: Requires specific permissions and may need the `username` parameter instead of `query`
4. **Response Size**: Large responses may be truncated by the MCP protocol limits