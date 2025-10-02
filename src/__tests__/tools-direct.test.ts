import { describe, test, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Import the actual tool handlers from your server
import { issueTools } from '../tools/issues.js';
import { projectTools } from '../tools/projects.js';
import { userTools } from '../tools/users.js';
import { fieldTools } from '../tools/fields.js';
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

  fs.writeFileSync(filePath, JSON.stringify(response, null, 2));
  console.log(`✅ Response saved to: ${filePath}`);

  // Also log the structure to console
  logToolResponse(toolName, response);

  return filePath;
}

// Utility to log response structure
function logToolResponse(toolName: string, response: any) {
  console.log(`\n📋 Tool Response: ${toolName}`);
  console.log('=' .repeat(50));

  if (response.success) {
    console.log('Status: SUCCESS ✅');
    if (response.data) {
      console.log('Data structure:');
      console.log(JSON.stringify(response.data, null, 2).substring(0, 1000));
      if (JSON.stringify(response.data).length > 1000) {
        console.log('... (truncated)');
      }
    }
  } else {
    console.log('Status: ERROR ❌');
    console.log('Error:', response.error);
  }

  console.log('=' .repeat(50));
}

describe('JIRA MCP Tools Direct Tests', () => {
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
        fields: ['key', 'summary', 'status'],
        startAt: 0
      };

      const response = await issueTools.jira_search_issues.handler(client, args);
      saveToolResponse('jira_search_issues', 'basic', response);

      expect(response).toBeDefined();
      expect(response.success).toBeDefined();
    }, 30000);

    test('jira_search_issues - text search', async () => {
      console.log('\n🔍 Testing: jira_search_issues (text search)');

      const args = {
        jql: 'project = IDS AND text ~ "VICAR"',
        maxResults: 3,
        fields: ['key', 'summary', 'status', 'priority'],
        startAt: 0
      };

      const response = await issueTools.jira_search_issues.handler(client, args);
      saveToolResponse('jira_search_issues', 'text_search', response);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_get_issue - specific issue', async () => {
      console.log('\n🔍 Testing: jira_get_issue');

      const args = {
        issueIdOrKey: 'IDS-10194',
        fields: ['summary', 'status', 'description', 'assignee', 'reporter', 'priority']
      };

      const response = await issueTools.jira_get_issue.handler(client, args);
      saveToolResponse('jira_get_issue', 'specific_issue', response);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_get_issue - with expand', async () => {
      console.log('\n🔍 Testing: jira_get_issue (with expand)');

      const args = {
        issueIdOrKey: 'IDS-10194',
        fields: ['key', 'summary', 'status'],
        expand: ['transitions']
      };

      const response = await issueTools.jira_get_issue.handler(client, args);
      saveToolResponse('jira_get_issue', 'with_expand', response);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_get_issue_comments', async () => {
      console.log('\n🔍 Testing: jira_get_issue_comments');

      const args = {
        issueIdOrKey: 'IDS-10194',
        maxResults: 5,
        startAt: 0
      };

      const response = await issueTools.jira_get_issue_comments.handler(client, args);
      saveToolResponse('jira_get_issue_comments', 'basic', response);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_get_issue_transitions', async () => {
      console.log('\n🔍 Testing: jira_get_issue_transitions');

      const args = {
        issueIdOrKey: 'IDS-10194',
        includeUnavailable: false
      };

      const response = await issueTools.jira_get_issue_transitions.handler(client, args);
      saveToolResponse('jira_get_issue_transitions', 'basic', response);

      expect(response).toBeDefined();
    }, 30000);
  });

  describe('Project Tools', () => {
    test('jira_list_projects', async () => {
      console.log('\n🔍 Testing: jira_list_projects');

      const args = {
        recent: 5,
        expand: ['description']
      };

      const response = await projectTools.jira_list_projects.handler(client, args);
      saveToolResponse('jira_list_projects', 'recent_with_description', response);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_get_project', async () => {
      console.log('\n🔍 Testing: jira_get_project');

      const args = {
        projectIdOrKey: 'IDS',
        expand: ['description', 'lead']
      };

      const response = await projectTools.jira_get_project.handler(client, args);
      saveToolResponse('jira_get_project', 'with_expand', response);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_search_projects', async () => {
      console.log('\n🔍 Testing: jira_search_projects');

      const args = {
        query: 'IDS',
        maxResults: 5,
        orderBy: 'name' as const,
        startAt: 0,
        action: 'view' as const
      };

      const response = await projectTools.jira_search_projects.handler(client, args);
      saveToolResponse('jira_search_projects', 'basic', response);

      expect(response).toBeDefined();
    }, 30000);
  });

  describe('User Tools', () => {
    test('jira_get_current_user', async () => {
      console.log('\n🔍 Testing: jira_get_current_user');

      const args = {
        expand: 'groups'
      };

      const response = await userTools.jira_get_current_user.handler(client, args);
      saveToolResponse('jira_get_current_user', 'with_groups', response);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_search_users', async () => {
      console.log('\n🔍 Testing: jira_search_users');

      const args = {
        query: 'admin',
        maxResults: 3,
        startAt: 0
      };

      const response = await userTools.jira_search_users.handler(client, args);
      saveToolResponse('jira_search_users', 'basic', response);

      expect(response).toBeDefined();
    }, 30000);
  });

  describe('Field Tools', () => {
    test('jira_get_issue_types', async () => {
      console.log('\n🔍 Testing: jira_get_issue_types');

      const args = {
        projectIdOrKey: 'IDS',
        maxResults: 10,
        startAt: 0
      };

      const response = await fieldTools.jira_get_issue_types.handler(client, args);
      saveToolResponse('jira_get_issue_types', 'basic', response);

      expect(response).toBeDefined();
      expect(response.success).toBeDefined();
    }, 30000);

    test('jira_get_issue_type_fields', async () => {
      console.log('\n🔍 Testing: jira_get_issue_type_fields');

      // First get issue types to get a valid issue type ID
      const issueTypesResponse = await fieldTools.jira_get_issue_types.handler(client, {
        projectIdOrKey: 'IDS',
        maxResults: 1,
        startAt: 0
      });

      if (issueTypesResponse.success && issueTypesResponse.data.issueTypes.length > 0) {
        const issueTypeId = issueTypesResponse.data.issueTypes[0].id;

        const args = {
          projectIdOrKey: 'IDS',
          issueTypeId: issueTypeId,
          maxResults: 50,
          startAt: 0
        };

        const response = await fieldTools.jira_get_issue_type_fields.handler(client, args);
        saveToolResponse('jira_get_issue_type_fields', 'basic', response);

        expect(response).toBeDefined();
        expect(response.success).toBeDefined();
      } else {
        console.log('⚠️  Skipping jira_get_issue_type_fields test - no issue types found');
      }
    }, 30000);

    test('jira_get_issue_field_names - basic', async () => {
      console.log('\n🔍 Testing: jira_get_issue_field_names - basic');

      const args = {
        issueIdOrKey: testIssueKey
      };

      const response = await fieldTools.jira_get_issue_field_names.handler(client, args);
      saveToolResponse('jira_get_issue_field_names', 'basic', response);

      expect(response).toBeDefined();
      expect(response.success).toBeDefined();
    }, 30000);

    test('jira_search_issue_fields - single term', async () => {
      console.log('\n🔍 Testing: jira_search_issue_fields - single search term');

      const args = {
        issueIdOrKey: testIssueKey,
        searchTerms: ['test']
      };

      const response = await fieldTools.jira_search_issue_fields.handler(client, args);
      saveToolResponse('jira_search_issue_fields', 'single_term', response);

      expect(response).toBeDefined();
      expect(response.success).toBeDefined();
    }, 30000);

    test('jira_search_issue_fields - multiple terms', async () => {
      console.log('\n🔍 Testing: jira_search_issue_fields - multiple search terms');

      const args = {
        issueIdOrKey: testIssueKey,
        searchTerms: ['target', 'date', 'summary']
      };

      const response = await fieldTools.jira_search_issue_fields.handler(client, args);
      saveToolResponse('jira_search_issue_fields', 'multiple_terms', response);

      expect(response).toBeDefined();
      expect(response.success).toBeDefined();
    }, 30000);
  });

  describe('Error Cases', () => {
    test('jira_get_issue - invalid key', async () => {
      console.log('\n🔍 Testing: Error - invalid issue key');

      const args = {
        issueIdOrKey: 'INVALID-99999'
      };

      const response = await issueTools.jira_get_issue.handler(client, args);
      saveToolResponse('errors', 'invalid_issue', response);

      // Response should indicate failure
      expect(response).toBeDefined();
      expect(response.success).toBe(false);
    }, 30000);

    test('jira_search_issues - malformed JQL', async () => {
      console.log('\n🔍 Testing: Error - malformed JQL');

      const args = {
        jql: 'project = AND status =',
        maxResults: 50,
        startAt: 0
      };

      const response = await issueTools.jira_search_issues.handler(client, args);
      saveToolResponse('errors', 'malformed_jql', response);

      // Response should indicate failure
      expect(response).toBeDefined();
      expect(response.success).toBe(false);
    }, 30000);
  });
});

// After all tests, create a summary
afterAll(() => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Tool Direct Testing Complete!');
  console.log('='.repeat(60));
  console.log(`\n✅ All tool responses saved to: ${LOG_DIR}`);
  console.log('\n📝 Next Steps:');
  console.log('1. Review the JSON files in the log directory');
  console.log('2. Update the MCP tool documentation based on actual response structures');
  console.log('3. Note any differences between expected and actual responses');
  console.log('\nRun the documentation generator:');
  console.log('  npx tsx src/__tests__/generate-mcp-docs.ts');
});