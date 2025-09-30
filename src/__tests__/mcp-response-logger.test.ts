import { describe, test, expect, beforeAll } from '@jest/globals';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Create a directory for response logs
const LOG_DIR = path.join(process.cwd(), '__mcp_response_logs__');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Utility to save responses to files
function saveResponse(toolName: string, testName: string, response: any) {
  const fileName = `${toolName}_${testName}_${Date.now()}.json`;
  const filePath = path.join(LOG_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(response, null, 2));
  console.log(`✅ Response saved to: ${filePath}`);
  return filePath;
}

// Utility to log response structure
function logResponseStructure(toolName: string, response: any, depth = 0, maxDepth = 3) {
  const indent = '  '.repeat(depth);

  if (depth === 0) {
    console.log(`\n📋 Response structure for ${toolName}:`);
    console.log('=' .repeat(50));
  }

  if (depth >= maxDepth) {
    console.log(`${indent}... (truncated at depth ${maxDepth})`);
    return;
  }

  if (response === null || response === undefined) {
    console.log(`${indent}${response}`);
    return;
  }

  if (Array.isArray(response)) {
    console.log(`${indent}Array[${response.length}]`);
    if (response.length > 0) {
      console.log(`${indent}  First item:`);
      logResponseStructure('', response[0], depth + 2, maxDepth);
    }
    return;
  }

  if (typeof response === 'object') {
    const keys = Object.keys(response);
    keys.forEach(key => {
      const value = response[key];
      const valueType = Array.isArray(value) ? 'Array' : typeof value;

      if (valueType === 'object' && value !== null) {
        console.log(`${indent}${key}: {`);
        logResponseStructure('', value, depth + 1, maxDepth);
        console.log(`${indent}}`);
      } else if (valueType === 'Array') {
        console.log(`${indent}${key}: Array[${value.length}]`);
        if (value.length > 0) {
          logResponseStructure('', value[0], depth + 1, maxDepth);
        }
      } else {
        const displayValue = typeof value === 'string' && value.length > 50
          ? `"${value.substring(0, 50)}..."`
          : JSON.stringify(value);
        console.log(`${indent}${key}: ${valueType} = ${displayValue}`);
      }
    });
    return;
  }

  console.log(`${indent}${typeof response}: ${JSON.stringify(response)}`);
}

describe('MCP Server Response Logging Tests', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    // Start the MCP server
    const serverProcess = spawn('tsx', ['src/index.ts'], {
      env: { ...process.env },
    });

    transport = new StdioClientTransport({
      command: 'tsx',
      args: ['src/index.ts'],
    });

    client = new Client(
      {
        name: 'mcp-response-logger',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);
    console.log('🚀 MCP Server connected');
  }, 30000);

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('Issue Tools', () => {
    test('jira_search_issues - basic search', async () => {
      console.log('\n🔍 Testing: jira_search_issues (basic)');

      const response = await client.callTool({
        name: 'jira_search_issues',
        arguments: {
          jql: 'project = IDS',
          maxResults: 2,
          fields: ['key', 'summary', 'status']
        }
      });

      saveResponse('jira_search_issues', 'basic', response);
      logResponseStructure('jira_search_issues', response.content);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_search_issues - with text search', async () => {
      console.log('\n🔍 Testing: jira_search_issues (text search)');

      const response = await client.callTool({
        name: 'jira_search_issues',
        arguments: {
          jql: 'project = IDS AND text ~ "VICAR"',
          maxResults: 2,
          startAt: 0,
          fields: ['key', 'summary', 'status', 'assignee', 'priority']
        }
      });

      saveResponse('jira_search_issues', 'text_search', response);
      logResponseStructure('jira_search_issues', response.content);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_get_issue - specific issue with limited fields', async () => {
      console.log('\n🔍 Testing: jira_get_issue (limited fields)');

      const response = await client.callTool({
        name: 'jira_get_issue',
        arguments: {
          issueIdOrKey: 'IDS-10194',
          fields: ['summary', 'status', 'description', 'assignee', 'reporter']
        }
      });

      saveResponse('jira_get_issue', 'limited_fields', response);
      logResponseStructure('jira_get_issue', response.content);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_get_issue - with expand options', async () => {
      console.log('\n🔍 Testing: jira_get_issue (with expand)');

      const response = await client.callTool({
        name: 'jira_get_issue',
        arguments: {
          issueIdOrKey: 'IDS-10194',
          fields: ['key', 'summary', 'status'],
          expand: ['transitions', 'renderedFields']
        }
      });

      saveResponse('jira_get_issue', 'with_expand', response);
      logResponseStructure('jira_get_issue', response.content);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_get_issue_comments', async () => {
      console.log('\n🔍 Testing: jira_get_issue_comments');

      const response = await client.callTool({
        name: 'jira_get_issue_comments',
        arguments: {
          issueIdOrKey: 'IDS-10194',
          maxResults: 5,
          startAt: 0
        }
      });

      saveResponse('jira_get_issue_comments', 'basic', response);
      logResponseStructure('jira_get_issue_comments', response.content);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_get_issue_transitions', async () => {
      console.log('\n🔍 Testing: jira_get_issue_transitions');

      const response = await client.callTool({
        name: 'jira_get_issue_transitions',
        arguments: {
          issueIdOrKey: 'IDS-10194',
          includeUnavailable: true
        }
      });

      saveResponse('jira_get_issue_transitions', 'basic', response);
      logResponseStructure('jira_get_issue_transitions', response.content);

      expect(response).toBeDefined();
    }, 30000);
  });

  describe('Project Tools', () => {
    test('jira_list_projects', async () => {
      console.log('\n🔍 Testing: jira_list_projects');

      const response = await client.callTool({
        name: 'jira_list_projects',
        arguments: {
          recent: 5,
          expand: ['description', 'lead']
        }
      });

      saveResponse('jira_list_projects', 'with_expand', response);
      logResponseStructure('jira_list_projects', response.content);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_get_project', async () => {
      console.log('\n🔍 Testing: jira_get_project');

      const response = await client.callTool({
        name: 'jira_get_project',
        arguments: {
          projectIdOrKey: 'IDS',
          expand: ['description', 'lead', 'issueTypes']
        }
      });

      saveResponse('jira_get_project', 'with_expand', response);
      logResponseStructure('jira_get_project', response.content);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_search_projects', async () => {
      console.log('\n🔍 Testing: jira_search_projects');

      const response = await client.callTool({
        name: 'jira_search_projects',
        arguments: {
          query: 'IDS',
          maxResults: 5,
          orderBy: 'name'
        }
      });

      saveResponse('jira_search_projects', 'basic', response);
      logResponseStructure('jira_search_projects', response.content);

      expect(response).toBeDefined();
    }, 30000);
  });

  describe('User Tools', () => {
    test('jira_get_current_user', async () => {
      console.log('\n🔍 Testing: jira_get_current_user');

      const response = await client.callTool({
        name: 'jira_get_current_user',
        arguments: {
          expand: 'groups,applicationRoles'
        }
      });

      saveResponse('jira_get_current_user', 'with_expand', response);
      logResponseStructure('jira_get_current_user', response.content);

      expect(response).toBeDefined();
    }, 30000);

    test('jira_search_users', async () => {
      console.log('\n🔍 Testing: jira_search_users');

      const response = await client.callTool({
        name: 'jira_search_users',
        arguments: {
          query: 'admin',
          maxResults: 5
        }
      });

      saveResponse('jira_search_users', 'basic', response);
      logResponseStructure('jira_search_users', response.content);

      expect(response).toBeDefined();
    }, 30000);
  });

  describe('Error Cases', () => {
    test('invalid issue key', async () => {
      console.log('\n🔍 Testing: Error - invalid issue key');

      try {
        const response = await client.callTool({
          name: 'jira_get_issue',
          arguments: {
            issueIdOrKey: 'INVALID-99999'
          }
        });
        saveResponse('errors', 'invalid_issue', response);
        logResponseStructure('error_invalid_issue', response.content);
      } catch (error: any) {
        saveResponse('errors', 'invalid_issue_error', error);
        console.log('Expected error:', error.message);
      }
    }, 30000);

    test('malformed JQL', async () => {
      console.log('\n🔍 Testing: Error - malformed JQL');

      try {
        const response = await client.callTool({
          name: 'jira_search_issues',
          arguments: {
            jql: 'project = AND status ='
          }
        });
        saveResponse('errors', 'malformed_jql', response);
        logResponseStructure('error_malformed_jql', response.content);
      } catch (error: any) {
        saveResponse('errors', 'malformed_jql_error', error);
        console.log('Expected error:', error.message);
      }
    }, 30000);
  });
});

// Summary report generator
afterAll(() => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MCP Response Logging Complete!');
  console.log('='.repeat(60));
  console.log(`\n✅ All responses saved to: ${LOG_DIR}`);
  console.log('\nYou can now review the response files to update the MCP documentation.');
  console.log('Each file contains the full response structure from the MCP server.');
});