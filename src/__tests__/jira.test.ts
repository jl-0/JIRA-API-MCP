import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('JIRA API Tests', () => {
  const baseUrl = process.env.JIRA_BASE_URL;
  const apiToken = process.env.JIRA_API_TOKEN;

  // Create axios instance with auth
  const jiraClient = axios.create({
    baseURL: baseUrl,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Atlassian-Token': 'no-check'
    },
    timeout: parseInt(process.env.JIRA_TIMEOUT || '30000')
  });

  beforeAll(() => {
    // Check that required environment variables are set
    if (!baseUrl || !apiToken) {
      throw new Error('Missing required environment variables: JIRA_BASE_URL and JIRA_API_TOKEN must be set in .env file');
    }
  });

  describe('IDS Project Tests', () => {
    test('should count the total number of issues in IDS project', async () => {
      const response = await jiraClient.get('/rest/api/2/search', {
        params: {
          jql: 'project = IDS',
          maxResults: 0, // We just want the total count
          fields: 'key' // Minimize data returned
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('total');

      const totalIssues = response.data.total;
      console.log(`Total issues in IDS project: ${totalIssues}`);

      expect(typeof totalIssues).toBe('number');
      expect(totalIssues).toBeGreaterThanOrEqual(0);
    });

    test('should search for issues in IDS project containing "VICAR"', async () => {
      const response = await jiraClient.get('/rest/api/2/search', {
        params: {
          jql: 'project = IDS AND text ~ "VICAR"',
          maxResults: 50,
          fields: 'key,summary,status'
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('issues');
      expect(Array.isArray(response.data.issues)).toBe(true);

      const issues = response.data.issues;
      const totalMatches = response.data.total;

      console.log(`Found ${totalMatches} issues in IDS project containing "VICAR"`);

      if (issues.length > 0) {
        console.log('\nFirst few matching issues:');
        issues.slice(0, 5).forEach((issue: any) => {
          console.log(`  - ${issue.key}: ${issue.fields.summary} (Status: ${issue.fields.status.name})`);
        });
      }

      expect(typeof totalMatches).toBe('number');
      expect(totalMatches).toBeGreaterThanOrEqual(0);
    });

    test('should perform advanced search with multiple criteria', async () => {
      // Search for issues in IDS project with VICAR that are not closed
      const response = await jiraClient.get('/rest/api/2/search', {
        params: {
          jql: 'project = IDS AND text ~ "VICAR" AND status != Closed',
          maxResults: 10,
          fields: 'key,summary,status,priority,created'
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('issues');

      const issues = response.data.issues;
      console.log(`\nFound ${response.data.total} open/in-progress issues with "VICAR" in IDS project`);

      if (issues.length > 0) {
        // Verify that none of the returned issues are closed
        issues.forEach((issue: any) => {
          expect(issue.fields.status.name).not.toBe('Closed');
        });
      }
    });
  });

  describe('Specific Issue Tests', () => {
    test('should retrieve IDS-10194 issue details', async () => {
      const response = await jiraClient.get('/rest/api/2/issue/IDS-10194', {
        params: {
          fields: 'summary,status,assignee,reporter,priority,description,created,updated,issuetype,components,fixVersions'
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('key');
      expect(response.data.key).toBe('IDS-10194');

      const issue = response.data;
      console.log('\n=== IDS-10194 Summary ===');
      console.log(`Key: ${issue.key}`);
      console.log(`Summary: ${issue.fields.summary}`);
      console.log(`Status: ${issue.fields.status?.name}`);
      console.log(`Priority: ${issue.fields.priority?.name}`);
      console.log(`Type: ${issue.fields.issuetype?.name}`);
      console.log(`Assignee: ${issue.fields.assignee?.displayName || 'Unassigned'}`);
      console.log(`Reporter: ${issue.fields.reporter?.displayName}`);
      console.log(`Created: ${issue.fields.created}`);
      console.log(`Updated: ${issue.fields.updated}`);
      if (issue.fields.components?.length > 0) {
        console.log(`Components: ${issue.fields.components.map((c: any) => c.name).join(', ')}`);
      }
      if (issue.fields.fixVersions?.length > 0) {
        console.log(`Fix Versions: ${issue.fields.fixVersions.map((v: any) => v.name).join(', ')}`);
      }
      if (issue.fields.description) {
        console.log(`\nDescription: ${issue.fields.description.substring(0, 200)}...`);
      }
    });
  });

  describe('Connection and Authentication Tests', () => {
    test('should successfully authenticate with JIRA', async () => {
      const response = await jiraClient.get('/rest/api/2/myself');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('key');
      expect(response.data).toHaveProperty('emailAddress');

      console.log(`\nAuthenticated as: ${response.data.displayName} (${response.data.emailAddress})`);
    });

    test('should retrieve IDS project details', async () => {
      const response = await jiraClient.get('/rest/api/2/project/IDS');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('key');
      expect(response.data.key).toBe('IDS');
      expect(response.data).toHaveProperty('name');

      console.log(`\nProject: ${response.data.name} (${response.data.key})`);
      if (response.data.description) {
        console.log(`Description: ${response.data.description}`);
      }
    });
  });
});