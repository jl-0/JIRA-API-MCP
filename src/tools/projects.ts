import { z } from 'zod';
import { JiraClient } from '../client/JiraClient.js';

const ListProjectsSchema = z.object({
  expand: z.array(z.string()).optional().describe('Optional array of additional data to expand. Example: ["description", "lead", "url", "projectKeys"]. Commonly used values: description, lead, url, projectKeys'),
  recent: z.number().optional().describe('Optional number to return only the N most recent projects. Must be a number, not a string. Example: 10 to get the 10 most recent projects')
});

const GetProjectSchema = z.object({
  projectIdOrKey: z.string().describe('The JIRA project ID or key to retrieve. Example: "IDS" or "10000"'),
  expand: z.array(z.string()).optional().describe('Optional array of additional data to expand. Example: ["description", "lead", "issueTypes", "components", "versions"]')
});

const SearchProjectsSchema = z.object({
  query: z.string().optional().describe('Search query string'),
  maxResults: z.number().optional().default(50).describe('Maximum number of results as a number (default: 50). Must be a number, not a string.'),
  startAt: z.number().optional().default(0).describe('Starting index for pagination as a number (default: 0). Must be a number, not a string.'),
  orderBy: z.enum(['category', '-category', '+category', 'key', '-key', '+key', 'name', '-name', '+name', 'owner', '-owner', '+owner']).optional().default('key').describe('Order results by field'),
  typeKey: z.string().optional().describe('Project type key'),
  categoryId: z.number().optional().describe('Project category ID as a number. Must be a number, not a string.'),
  action: z.enum(['view', 'browse', 'edit']).optional().default('browse').describe('Filter by permission')
});

export const projectTools = {
  jira_list_projects: {
    description: 'List all JIRA projects accessible to the authenticated user',
    inputSchema: ListProjectsSchema,
    handler: async (client: JiraClient, input: z.infer<typeof ListProjectsSchema>) => {
      try {
        const projects = await client.getAllProjects({
          expand: input.expand,
          recent: input.recent
        });

        return {
          success: true,
          data: {
            total: projects.length,
            projects: projects.map(project => ({
              key: project.key,
              id: project.id,
              name: project.name,
              projectTypeKey: project.projectTypeKey,
              style: project.style,
              isPrivate: project.simplified === false,
              avatarUrls: project.avatarUrls
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

  jira_get_project: {
    description: 'Get detailed information about a specific JIRA project',
    inputSchema: GetProjectSchema,
    handler: async (client: JiraClient, input: z.infer<typeof GetProjectSchema>) => {
      try {
        const project = await client.getProject(input.projectIdOrKey, {
          expand: input.expand
        });

        return {
          success: true,
          data: {
            key: project.key,
            id: project.id,
            name: project.name,
            description: project.description,
            lead: project.lead ? {
              displayName: project.lead.displayName,
              accountId: project.lead.accountId
            } : undefined,
            projectTypeKey: project.projectTypeKey,
            style: project.style,
            isPrivate: project.simplified === false,
            avatarUrls: project.avatarUrls,
            category: project.projectCategory ? {
              id: project.projectCategory.id,
              name: project.projectCategory.name,
              description: project.projectCategory.description
            } : undefined,
            components: project.components?.map(c => ({
              id: c.id,
              name: c.name,
              description: c.description
            })),
            issueTypes: project.issueTypes?.map(it => ({
              id: it.id,
              name: it.name,
              description: it.description,
              subtask: it.subtask,
              hierarchyLevel: it.hierarchyLevel
            })),
            versions: project.versions?.map(v => ({
              id: v.id,
              name: v.name,
              description: v.description,
              archived: v.archived,
              released: v.released,
              releaseDate: v.releaseDate
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

  jira_search_projects: {
    description: 'Search for JIRA projects based on various criteria',
    inputSchema: SearchProjectsSchema,
    handler: async (client: JiraClient, input: z.infer<typeof SearchProjectsSchema>) => {
      try {
        const result = await client.searchProjects({
          query: input.query,
          maxResults: input.maxResults,
          startAt: input.startAt,
          orderBy: input.orderBy,
          typeKey: input.typeKey,
          categoryId: input.categoryId,
          action: input.action
        });

        return {
          success: true,
          data: {
            total: result.total,
            startAt: result.startAt,
            maxResults: result.maxResults,
            isLast: result.isLast,
            projects: result.values.map(project => ({
              key: project.key,
              id: project.id,
              name: project.name,
              projectTypeKey: project.projectTypeKey,
              style: project.style,
              isPrivate: project.simplified === false,
              avatarUrls: project.avatarUrls
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