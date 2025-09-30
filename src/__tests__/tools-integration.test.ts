import { describe, test, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Import the actual tool handlers from your server
import { issueTools } from '../tools/issues.js';
import { projectTools } from '../tools/projects.js';
import { userTools } from '../tools/users.js';
import { JiraClient } from '../client/JiraClient.js';
import type { JiraConfig } from '../client/types.js';

dotenv.config();

// Create a directory for response logs
const LOG_DIR = path.join(process.cwd(), '__tool_response_logs__');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Utility to save responses
function saveToolResponse(toolName: string, testName: string, response: any) {
  const fileName = `${toolName}_${testName}_${Date.now()}.json`;
  const filePath = path.join(LOG_DIR, fileName);

  // Create a clean version for saving (remove any circular references)
  const cleanResponse = JSON.parse(JSON.stringify(response, (key, value) => {
    if (key === 'client' || key === '_client') return '[JiraClient Instance]';
    return value;
  }));

  fs.writeFileSync(filePath, JSON.stringify(cleanResponse, null, 2));
  console.log(`✅ Response saved to: ${filePath}`);

  // Also log the structure to console
  logToolResponse(toolName, response);

  return filePath;
}

// Utility to log response structure
function logToolResponse(toolName: string, response: any, maxDepth = 2) {
  console.log(`\n📋 Tool Response: ${toolName}`);
  console.log('=' .repeat(50));

  // Handle text responses
  if (response && response.content && Array.isArray(response.content)) {
    response.content.forEach((item: any, index: number) => {
      if (item.type === 'text') {
        console.log(`Content[${index}] (text):`);

        // Try to parse as JSON if it looks like JSON
        let parsed = item.text;
        try {
          if (typeof item.text === 'string' && (item.text.startsWith('{') || item.text.startsWith('['))) {
            parsed = JSON.parse(item.text);
          }
        } catch {}

        if (typeof parsed === 'object') {
          console.log(JSON.stringify(parsed, null, 2).substring(0, 1000));
          if (JSON.stringify(parsed).length > 1000) {
            console.log('... (truncated)');
          }
        } else {
          console.log(item.text.substring(0, 500));
          if (item.text.length > 500) {
            console.log('... (truncated)');
          }
        }
      }
    });
  } else {
    console.log(JSON.stringify(response, null, 2).substring(0, 1000));
  }

  console.log('=' .repeat(50));
}

describe('JIRA MCP Tools Integration Tests', () => {
  let client: JiraClient;

  beforeAll(() => {
    // Initialize the JIRA client
    const baseUrl = process.env.JIRA_BASE_URL;
    const apiToken = process.env.JIRA_API_TOKEN;

    if (!baseUrl || !apiToken) {
      throw new Error('Missing required environment variables: JIRA_BASE_URL and JIRA_API_TOKEN');
    }

    const config: JiraConfig = {
      baseUrl,
      apiToken,
      timeout: parseInt(process.env.JIRA_TIMEOUT || '30000')
    };

    client = new JiraClient(config);
  });

  describe('Issue Tools', () => {
    test('jira_search_issues - basic search', async () => {
      console.log('\n🔍 Testing: jira_search_issues (basic)');

      const args = {
        jql: 'project = IDS',
        maxResults: 2,
        fields: ['key', 'summary', 'status']
      };

      const response = await issueTools.jira_search_issues.handler(client, args);
      saveToolResponse('jira_search_issues', 'basic', response);

      expect(response).toBeDefined();
      expect(response.success).toBeDefined();
    }, 30000);

    test('searchIssues - text search', async () => {
      console.log('\n🔍 Testing: searchIssues (text search)');

      const args = {
        jql: 'project = IDS AND text ~ "VICAR"',
        maxResults: 3,
        fields: ['key', 'summary', 'status', 'priority']
      };

      const response = await searchIssues(args, client);
      saveToolResponse('searchIssues', 'text_search', response);

      expect(response).toBeDefined();
    }, 30000);

    test('getIssue - specific issue', async () => {
      console.log('\n🔍 Testing: getIssue');

      const args = {
        issueIdOrKey: 'IDS-10194',
        fields: ['summary', 'status', 'description', 'assignee', 'reporter', 'priority']
      };

      const response = await getIssue(args, client);
      saveToolResponse('getIssue', 'specific_issue', response);

      expect(response).toBeDefined();
    }, 30000);

    test('getIssue - with expand', async () => {
      console.log('\n🔍 Testing: getIssue (with expand)');

      const args = {
        issueIdOrKey: 'IDS-10194',
        fields: ['key', 'summary', 'status'],
        expand: ['transitions']
      };

      const response = await getIssue(args, client);
      saveToolResponse('getIssue', 'with_expand', response);

      expect(response).toBeDefined();
    }, 30000);

    test('getIssueComments', async () => {
      console.log('\n🔍 Testing: getIssueComments');

      const args = {
        issueIdOrKey: 'IDS-10194',
        maxResults: 5,
        startAt: 0
      };

      const response = await getIssueComments(args, client);
      saveToolResponse('getIssueComments', 'basic', response);

      expect(response).toBeDefined();
    }, 30000);

    test('getIssueTransitions', async () => {
      console.log('\n🔍 Testing: getIssueTransitions');

      const args = {
        issueIdOrKey: 'IDS-10194',
        includeUnavailable: false
      };

      const response = await getIssueTransitions(args, client);
      saveToolResponse('getIssueTransitions', 'basic', response);

      expect(response).toBeDefined();
    }, 30000);
  });

  describe('Project Tools', () => {
    test('listProjects', async () => {
      console.log('\n🔍 Testing: listProjects');

      const args = {
        recent: 5,
        expand: ['description']
      };

      const response = await listProjects(args, client);
      saveToolResponse('listProjects', 'recent_with_description', response);

      expect(response).toBeDefined();
    }, 30000);

    test('getProject', async () => {
      console.log('\n🔍 Testing: getProject');

      const args = {
        projectIdOrKey: 'IDS',
        expand: ['description', 'lead']
      };

      const response = await getProject(args, client);
      saveToolResponse('getProject', 'with_expand', response);

      expect(response).toBeDefined();
    }, 30000);

    test('searchProjects', async () => {
      console.log('\n🔍 Testing: searchProjects');

      const args = {
        query: 'IDS',
        maxResults: 5,
        orderBy: 'name'
      };

      const response = await searchProjects(args, client);
      saveToolResponse('searchProjects', 'basic', response);

      expect(response).toBeDefined();
    }, 30000);
  });

  describe('User Tools', () => {
    test('getCurrentUser', async () => {
      console.log('\n🔍 Testing: getCurrentUser');

      const args = {
        expand: 'groups'
      };

      const response = await getCurrentUser(args, client);
      saveToolResponse('getCurrentUser', 'with_groups', response);

      expect(response).toBeDefined();
    }, 30000);

    test('searchUsers', async () => {
      console.log('\n🔍 Testing: searchUsers');

      const args = {
        query: 'admin',
        maxResults: 3
      };

      const response = await searchUsers(args, client);
      saveToolResponse('searchUsers', 'basic', response);

      expect(response).toBeDefined();
    }, 30000);
  });

  describe('Error Cases', () => {
    test('getIssue - invalid key', async () => {
      console.log('\n🔍 Testing: Error - invalid issue key');

      const args = {
        issueIdOrKey: 'INVALID-99999'
      };

      try {
        const response = await getIssue(args, client);
        saveToolResponse('errors', 'invalid_issue', response);
      } catch (error: any) {
        console.log('Expected error caught:', error.message);
        saveToolResponse('errors', 'invalid_issue_error', { error: error.message });
      }
    }, 30000);

    test('searchIssues - malformed JQL', async () => {
      console.log('\n🔍 Testing: Error - malformed JQL');

      const args = {
        jql: 'project = AND status ='
      };

      try {
        const response = await searchIssues(args, client);
        saveToolResponse('errors', 'malformed_jql', response);
      } catch (error: any) {
        console.log('Expected error caught:', error.message);
        saveToolResponse('errors', 'malformed_jql_error', { error: error.message });
      }
    }, 30000);
  });
});

// After all tests, create a summary
afterAll(() => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Tool Integration Testing Complete!');
  console.log('='.repeat(60));
  console.log(`\n✅ All tool responses saved to: ${LOG_DIR}`);
  console.log('\n📝 Next Steps:');
  console.log('1. Review the JSON files in the log directory');
  console.log('2. Update the MCP tool documentation based on actual response structures');
  console.log('3. Note any differences between expected and actual responses');
});