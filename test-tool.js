#!/usr/bin/env node

// This script demonstrates how to call the JIRA MCP tools correctly

const toolExamples = {
  "jira_get_issue": {
    description: "Get detailed information about a specific JIRA issue",
    requiredParams: {
      issueIdOrKey: "IDS-10194"  // This parameter is REQUIRED
    },
    optionalParams: {
      fields: ["summary", "status", "description"],
      expand: ["changelog"],
      properties: ["*all"],
      updateHistory: false
    },
    example: {
      // Minimal call - only required parameter
      minimal: {
        issueIdOrKey: "IDS-10194"
      },
      // Full call - with optional parameters
      full: {
        issueIdOrKey: "IDS-10194",
        fields: ["summary", "status", "description", "assignee"],
        expand: ["changelog", "transitions"],
        properties: ["prop1", "prop2"],
        updateHistory: true
      }
    }
  },

  "jira_search_issues": {
    description: "Search for issues using JQL",
    requiredParams: {
      jql: "project = IDS"  // This parameter is REQUIRED
    },
    optionalParams: {
      maxResults: 10,
      fields: ["summary", "status"],
      expand: ["changelog"],
      properties: ["*all"],
      startAt: 0
    },
    example: {
      // Minimal call - only required parameter
      minimal: {
        jql: "project = IDS"
      },
      // Full call - with optional parameters
      full: {
        jql: "project = IDS AND status = Open",
        maxResults: 5,
        fields: ["summary", "status", "assignee"],
        expand: ["renderedFields"],
        properties: ["*all"],
        startAt: 0
      }
    }
  },

  "jira_get_issue_comments": {
    description: "Get comments for an issue",
    requiredParams: {
      issueIdOrKey: "IDS-10194"  // This parameter is REQUIRED
    },
    optionalParams: {
      maxResults: 50,
      startAt: 0
    },
    example: {
      minimal: {
        issueIdOrKey: "IDS-10194"
      },
      full: {
        issueIdOrKey: "IDS-10194",
        maxResults: 10,
        startAt: 0
      }
    }
  },

  "jira_get_issue_transitions": {
    description: "Get available transitions for an issue",
    requiredParams: {
      issueIdOrKey: "IDS-10194"  // This parameter is REQUIRED
    },
    optionalParams: {
      includeUnavailable: false
    },
    example: {
      minimal: {
        issueIdOrKey: "IDS-10194"
      },
      full: {
        issueIdOrKey: "IDS-10194",
        includeUnavailable: true
      }
    }
  }
};

console.log("=== JIRA MCP Tool Examples ===\n");
console.log("When using the MCP Inspector, make sure to provide the REQUIRED parameters!\n");

for (const [toolName, toolInfo] of Object.entries(toolExamples)) {
  console.log(`\n📌 ${toolName}`);
  console.log(`   ${toolInfo.description}`);
  console.log("\n   REQUIRED Parameters:");
  for (const [param, value] of Object.entries(toolInfo.requiredParams)) {
    console.log(`     - ${param}: "${value}" (example value)`);
  }

  if (Object.keys(toolInfo.optionalParams).length > 0) {
    console.log("\n   Optional Parameters:");
    for (const [param, value] of Object.entries(toolInfo.optionalParams)) {
      console.log(`     - ${param}: ${JSON.stringify(value)}`);
    }
  }

  console.log("\n   Example Usage in MCP Inspector:");
  console.log("   Minimal (required params only):");
  console.log(`   ${JSON.stringify(toolInfo.example.minimal, null, 2).split('\n').join('\n   ')}`);
  console.log("\n   Full (with optional params):");
  console.log(`   ${JSON.stringify(toolInfo.example.full, null, 2).split('\n').join('\n   ')}`);
}

console.log("\n" + "=".repeat(50));
console.log("\n⚠️  IMPORTANT: The error you're seeing:");
console.log(JSON.stringify({
  "success": false,
  "error": "Invalid arguments",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["issueIdOrKey"],
      "message": "Required"
    }
  ]
}, null, 2));

console.log("\nThis means you're not providing the 'issueIdOrKey' parameter when calling the tool.");
console.log("Make sure to include it in your request, like: { \"issueIdOrKey\": \"IDS-10194\" }");