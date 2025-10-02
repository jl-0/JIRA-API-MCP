import { z } from 'zod';
import { JiraClient } from '../client/JiraClient.js';

const SearchIssuesSchema = z.object({
  jql: z.string().describe('JQL query string to search for issues. Examples: "project = IDS", "assignee = currentUser() AND status = Open", "key = IDS-10314". IMPORTANT: Use "key = ISSUE-123" to query a specific issue, NOT "text ~ ISSUE-123" which performs unnecessary full-text search.'),
  maxResults: z.number().optional().default(50).describe('Maximum number of results to return as a number (default: 50, max: 100). Must be a number, not a string.'),
  fields: z.array(z.string()).optional().describe('Optional array of field names to include. Example: ["summary", "status", "assignee"]. Strongly recommended to specify only needed fields to reduce data transfer. If omitted, returns common fields: summary, status, priority, assignee, reporter, created, updated, issuetype, project, labels, components'),
  expand: z.array(z.string()).optional().describe('Optional array of entities to expand. Example: ["changelog", "transitions"]. Common values: changelog, renderedFields, transitions'),
  properties: z.array(z.string()).optional().describe('Optional array of issue properties to include. Example: ["prop1", "prop2"]. Use "*all" to include all properties'),
  startAt: z.number().optional().default(0).describe('Starting index for pagination as a number (default: 0). Use for fetching additional pages of results. Must be a number, not a string.')
});

const GetIssueSchema = z.object({
  issueIdOrKey: z.string().describe('The JIRA issue ID or key to retrieve. Example: "IDS-10194" or "PROJ-123"'),
  fields: z.array(z.string()).optional().describe('Optional array of specific fields to return. Example: ["summary", "status", "description", "assignee", "reporter", "priority"]. If omitted, returns common fields: summary, status, priority, assignee, reporter, created, updated, description, issuetype, project, resolution, resolutiondate, duedate, labels, components, fixVersions, versions'),
  expand: z.array(z.string()).optional().describe('Optional array of additional data to expand. Example: ["changelog", "transitions", "renderedFields"]. Warning: Some expand options may significantly increase response size'),
  properties: z.array(z.string()).optional().describe('Optional array of issue properties to include. Example: ["prop1", "prop2"]. Use "*all" to include all properties'),
  updateHistory: z.boolean().optional().describe('Whether to update the issue\'s history of views')
});

const GetIssueCommentsSchema = z.object({
  issueIdOrKey: z.string().describe('The JIRA issue ID or key to get comments for. Example: "IDS-10194"'),
  maxResults: z.number().optional().default(50).describe('Maximum number of comments to return as a number (default: 50). Must be a number, not a string.'),
  startAt: z.number().optional().default(0).describe('Starting index for pagination as a number (default: 0). Must be a number, not a string.')
});

const GetIssueTransitionsSchema = z.object({
  issueIdOrKey: z.string().describe('The JIRA issue ID or key to get transitions for. Example: "IDS-10194"'),
  includeUnavailable: z.boolean().optional().default(false).describe('Whether to include transitions that are not available to the current user (default: false)')
});

export const issueTools = {
  jira_search_issues: {
    description: 'Search for JIRA issues using JQL (JIRA Query Language). Use this to find issues based on various criteria like project, status, assignee, text content, etc. Returns a summary of matching issues.',
    inputSchema: SearchIssuesSchema,
    handler: async (client: JiraClient, input: z.infer<typeof SearchIssuesSchema>) => {
      try {
        // Use the standard search endpoint for Server/Data Center
        const result = await client.searchIssues(input.jql, {
          startAt: input.startAt,
          maxResults: input.maxResults,
          fields: input.fields,
          expand: input.expand,
          properties: input.properties
        });

        return {
          success: true,
          data: {
            total: result.total,
            startAt: result.startAt,
            maxResults: result.maxResults,
            isLast: result.startAt + result.issues.length >= result.total,
            issues: result.issues.map(issue => ({
              key: issue.key,
              id: issue.id,
              summary: issue.fields.summary,
              status: issue.fields.status?.name,
              priority: issue.fields.priority?.name,
              assignee: issue.fields.assignee?.displayName || 'Unassigned',
              reporter: issue.fields.reporter?.displayName,
              created: issue.fields.created,
              updated: issue.fields.updated,
              project: issue.fields.project?.name,
              issueType: {
                id: issue.fields.issuetype?.id,
                name: issue.fields.issuetype?.name,
                subtask: issue.fields.issuetype?.subtask
              },
              labels: issue.fields.labels,
              components: issue.fields.components?.map(c => c.name)
            }))
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  },

  jira_get_issue: {
    description: 'Get detailed information about a specific JIRA issue by its key (e.g., "IDS-10194"). Returns comprehensive issue details including summary, description, status, assignee, and custom fields. CRITICAL: Always use the fields parameter to request only specific fields needed - requesting all fields or omitting this parameter returns excessive data and may fail. For custom fields, use field discovery workflow first: (1) Get issue type with fields: ["issuetype", "project"], (2) Use jira_get_issue_type_fields to find field names/IDs, (3) Request only needed fields by name or customfield_XXXX ID. Example: fields: ["summary", "customfield_10001", "status"].',
    inputSchema: GetIssueSchema,
    handler: async (client: JiraClient, input: z.infer<typeof GetIssueSchema>) => {
      try {
        const issue = await client.getIssue(input.issueIdOrKey, {
          fields: input.fields,
          expand: input.expand,
          properties: input.properties,
          updateHistory: input.updateHistory
        });

        return {
          success: true,
          data: {
            key: issue.key,
            id: issue.id,
            summary: issue.fields.summary,
            description: issue.fields.description,
            status: {
              name: issue.fields.status?.name,
              category: issue.fields.status?.statusCategory?.name
            },
            priority: {
              name: issue.fields.priority?.name,
              id: issue.fields.priority?.id
            },
            assignee: issue.fields.assignee ? {
              displayName: issue.fields.assignee.displayName,
              accountId: issue.fields.assignee.accountId,
              email: issue.fields.assignee.emailAddress
            } : null,
            reporter: issue.fields.reporter ? {
              displayName: issue.fields.reporter.displayName,
              accountId: issue.fields.reporter.accountId,
              email: issue.fields.reporter.emailAddress
            } : null,
            created: issue.fields.created,
            updated: issue.fields.updated,
            resolved: issue.fields.resolved,
            project: {
              key: issue.fields.project?.key,
              name: issue.fields.project?.name
            },
            issueType: {
              name: issue.fields.issuetype?.name,
              subtask: issue.fields.issuetype?.subtask
            },
            labels: issue.fields.labels,
            components: issue.fields.components?.map(c => ({
              id: c.id,
              name: c.name
            })),
            fixVersions: issue.fields.fixVersions?.map(v => ({
              id: v.id,
              name: v.name,
              released: v.released
            })),
            customFields: Object.entries(issue.fields)
              .filter(([key]) => key.startsWith('customfield_'))
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  },

  jira_get_issue_comments: {
    description: 'Get all comments for a specific JIRA issue by its key (e.g., "IDS-10194"). Returns a paginated list of comments with author and timestamp information.',
    inputSchema: GetIssueCommentsSchema,
    handler: async (client: JiraClient, input: z.infer<typeof GetIssueCommentsSchema>) => {
      try {
        const result = await client.getIssueComments(input.issueIdOrKey, {
          maxResults: input.maxResults,
          startAt: input.startAt
        });

        return {
          success: true,
          data: {
            total: result.total,
            startAt: result.startAt,
            maxResults: result.maxResults,
            comments: result.comments.map(comment => ({
              id: comment.id,
              author: comment.author?.displayName,
              body: typeof comment.body === 'string' ? comment.body : JSON.stringify(comment.body),
              created: comment.created,
              updated: comment.updated,
              updateAuthor: comment.updateAuthor?.displayName
            }))
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  },

  jira_get_issue_transitions: {
    description: 'Get available workflow transitions for a JIRA issue by its key (e.g., "IDS-10194"). Shows what status changes are possible for the issue (e.g., Open -> In Progress, In Progress -> Resolved).',
    inputSchema: GetIssueTransitionsSchema,
    handler: async (client: JiraClient, input: z.infer<typeof GetIssueTransitionsSchema>) => {
      try {
        const result = await client.getIssueTransitions(input.issueIdOrKey, {
          includeUnavailableTransitions: input.includeUnavailable
        });

        return {
          success: true,
          data: {
            transitions: result.transitions.map(transition => ({
              id: transition.id,
              name: transition.name,
              to: {
                id: transition.to.id,
                name: transition.to.name,
                statusCategory: transition.to.statusCategory?.name
              },
              isAvailable: transition.isAvailable !== false,
              hasScreen: transition.hasScreen,
              isGlobal: transition.isGlobal,
              isInitial: transition.isInitial
            }))
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  }
};