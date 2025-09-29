import { z } from 'zod';
import { JiraClient } from '../client/JiraClient.js';

const SearchIssuesSchema = z.object({
  jql: z.string().describe('JQL query to search for issues'),
  maxResults: z.number().optional().default(50).describe('Maximum number of results to return'),
  fields: z.array(z.string()).optional().describe('Fields to include in the response'),
  expand: z.array(z.string()).optional().describe('Additional data to expand'),
  startAt: z.number().optional().default(0).describe('Starting index for pagination')
});

const GetIssueSchema = z.object({
  issueIdOrKey: z.string().describe('Issue ID or key (e.g., PROJ-123)'),
  fields: z.array(z.string()).optional().describe('Fields to include in the response'),
  expand: z.array(z.string()).optional().describe('Additional data to expand')
});

const GetIssueCommentsSchema = z.object({
  issueIdOrKey: z.string().describe('Issue ID or key (e.g., PROJ-123)'),
  maxResults: z.number().optional().default(50).describe('Maximum number of results'),
  startAt: z.number().optional().default(0).describe('Starting index for pagination')
});

const GetIssueTransitionsSchema = z.object({
  issueIdOrKey: z.string().describe('Issue ID or key (e.g., PROJ-123)'),
  includeUnavailable: z.boolean().optional().default(false).describe('Include unavailable transitions')
});

export const issueTools = {
  jira_search_issues: {
    description: 'Search for JIRA issues using JQL (JIRA Query Language)',
    inputSchema: SearchIssuesSchema,
    handler: async (client: JiraClient, input: z.infer<typeof SearchIssuesSchema>) => {
      try {
        const result = await client.searchIssuesJQL(input.jql, {
          maxResults: input.maxResults,
          fields: input.fields,
          expand: input.expand
        });

        return {
          success: true,
          data: {
            total: result.issues.length,
            isLast: result.isLast,
            nextPageToken: result.nextPageToken,
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
              issueType: issue.fields.issuetype?.name,
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
    description: 'Get detailed information about a specific JIRA issue',
    inputSchema: GetIssueSchema,
    handler: async (client: JiraClient, input: z.infer<typeof GetIssueSchema>) => {
      try {
        const issue = await client.getIssue(input.issueIdOrKey, {
          fields: input.fields,
          expand: input.expand
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
    description: 'Get comments for a specific JIRA issue',
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
    description: 'Get available transitions for a JIRA issue',
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