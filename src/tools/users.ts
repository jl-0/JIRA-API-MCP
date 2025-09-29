import { z } from 'zod';
import { JiraClient } from '../client/JiraClient.js';

const GetCurrentUserSchema = z.object({
  expand: z.string().optional().describe('Additional data to expand (groups, applicationRoles)')
});

const GetUserSchema = z.object({
  accountId: z.string().describe('The account ID of the user'),
  expand: z.string().optional().describe('Additional data to expand')
});

const SearchUsersSchema = z.object({
  query: z.string().optional().describe('Search query matching display name and email'),
  accountId: z.string().optional().describe('Find user by account ID'),
  maxResults: z.number().optional().default(50).describe('Maximum number of results'),
  startAt: z.number().optional().default(0).describe('Starting index for pagination')
});

export const userTools = {
  jira_get_current_user: {
    description: 'Get information about the currently authenticated JIRA user',
    inputSchema: GetCurrentUserSchema,
    handler: async (client: JiraClient, input: z.infer<typeof GetCurrentUserSchema>) => {
      try {
        const user = await client.getCurrentUser({
          expand: input.expand
        });

        return {
          success: true,
          data: {
            accountId: user.accountId,
            displayName: user.displayName,
            emailAddress: user.emailAddress,
            active: user.active,
            timeZone: user.timeZone,
            accountType: user.accountType,
            avatarUrls: user.avatarUrls
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

  jira_get_user: {
    description: 'Get information about a specific JIRA user by account ID',
    inputSchema: GetUserSchema,
    handler: async (client: JiraClient, input: z.infer<typeof GetUserSchema>) => {
      try {
        const user = await client.getUser(input.accountId, {
          expand: input.expand
        });

        return {
          success: true,
          data: {
            accountId: user.accountId,
            displayName: user.displayName,
            emailAddress: user.emailAddress,
            active: user.active,
            timeZone: user.timeZone,
            accountType: user.accountType,
            avatarUrls: user.avatarUrls
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

  jira_search_users: {
    description: 'Search for JIRA users by query string',
    inputSchema: SearchUsersSchema,
    handler: async (client: JiraClient, input: z.infer<typeof SearchUsersSchema>) => {
      try {
        const users = await client.searchUsers({
          query: input.query,
          accountId: input.accountId,
          maxResults: input.maxResults,
          startAt: input.startAt
        });

        return {
          success: true,
          data: {
            total: users.length,
            users: users.map(user => ({
              accountId: user.accountId,
              displayName: user.displayName,
              emailAddress: user.emailAddress,
              active: user.active,
              accountType: user.accountType,
              avatarUrls: user.avatarUrls
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