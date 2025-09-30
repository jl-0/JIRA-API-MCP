# MCP Inspector JSON Format Guide

## CRITICAL: JSON String Formatting in MCP Inspector

When using the MCP Inspector, you MUST provide valid JSON with proper string quotes!

### ✅ CORRECT Format (with quotes for strings)

```json
{
  "issueIdOrKey": "IDS-10194"
}
```

### ❌ WRONG Formats

These will NOT work:

```json
// Missing quotes - WRONG!
{
  "issueIdOrKey": IDS-10194
}

// Just the value without key - WRONG!
"IDS-10194"

// Without JSON object wrapper - WRONG!
IDS-10194
```

## Complete Examples for Each Tool

### 1. jira_get_issue

✅ **CORRECT:**
```json
{
  "issueIdOrKey": "IDS-10194"
}
```

With optional parameters:
```json
{
  "issueIdOrKey": "IDS-10194",
  "fields": ["summary", "status", "description"],
  "expand": ["changelog"],
  "updateHistory": true
}
```

### 2. jira_search_issues

✅ **CORRECT:**
```json
{
  "jql": "project = IDS"
}
```

More complex example:
```json
{
  "jql": "project = IDS AND status = Open",
  "maxResults": 5,
  "fields": ["key", "summary", "status"]
}
```

### 3. jira_get_issue_comments

✅ **CORRECT:**
```json
{
  "issueIdOrKey": "IDS-10194"
}
```

With pagination:
```json
{
  "issueIdOrKey": "IDS-10194",
  "maxResults": 10,
  "startAt": 0
}
```

### 4. jira_get_issue_transitions

✅ **CORRECT:**
```json
{
  "issueIdOrKey": "IDS-10194"
}
```

With include unavailable:
```json
{
  "issueIdOrKey": "IDS-10194",
  "includeUnavailable": true
}
```

### 5. jira_list_projects

✅ **CORRECT:**
```json
{
  "recent": 5
}
```

Or with no parameters:
```json
{}
```

### 6. jira_get_project

✅ **CORRECT:**
```json
{
  "projectIdOrKey": "IDS"
}
```

With expand:
```json
{
  "projectIdOrKey": "IDS",
  "expand": ["description", "lead", "issueTypes"]
}
```

### 7. jira_get_current_user

✅ **CORRECT (no parameters required):**
```json
{}
```

With expand:
```json
{
  "expand": "groups"
}
```

### 8. jira_search_users

✅ **CORRECT:**
```json
{
  "query": "jeff"
}
```

Or by account ID:
```json
{
  "accountId": "5a0a0000000000000000000"
}
```

## Important JSON Rules

1. **All string values MUST be in double quotes**: `"IDS-10194"` not `IDS-10194`
2. **Numbers don't need quotes**: `"maxResults": 10` not `"maxResults": "10"`
3. **Booleans don't need quotes**: `"updateHistory": true` not `"updateHistory": "true"`
4. **Arrays use square brackets**: `"fields": ["summary", "status"]`
5. **The entire input must be a valid JSON object**: `{ ... }`

## Common Mistakes and Fixes

### Mistake 1: Missing Quotes
❌ **WRONG:**
```json
{
  "issueIdOrKey": IDS-10194
}
```
✅ **CORRECT:**
```json
{
  "issueIdOrKey": "IDS-10194"
}
```

### Mistake 2: Wrong Quote Type
❌ **WRONG (single quotes):**
```json
{
  'issueIdOrKey': 'IDS-10194'
}
```
✅ **CORRECT (double quotes):**
```json
{
  "issueIdOrKey": "IDS-10194"
}
```

### Mistake 3: Treating Numbers as Strings
❌ **WRONG:**
```json
{
  "maxResults": "10"
}
```
✅ **CORRECT:**
```json
{
  "maxResults": 10
}
```

### Mistake 4: Forgetting the Object Wrapper
❌ **WRONG:**
```
"issueIdOrKey": "IDS-10194"
```
✅ **CORRECT:**
```json
{
  "issueIdOrKey": "IDS-10194"
}
```

## Testing in MCP Inspector

1. Open the MCP Inspector
2. Navigate to the **Tools** tab
3. Select a tool from the dropdown (e.g., `jira_get_issue`)
4. In the parameters text area, enter valid JSON as shown above
5. Click "Run Tool"
6. Check the response in the output pane

## Pro Tips

- Use a JSON validator before pasting into the Inspector
- Copy the examples from this guide and modify the values
- Start with minimal required parameters, then add optional ones
- The Inspector should show parameter hints when you select a tool
- If you get a validation error, check your JSON syntax first!