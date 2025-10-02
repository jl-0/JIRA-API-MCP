import { z } from 'zod';
import { JiraClient } from '../client/JiraClient.js';

const GetIssueTypesSchema = z.object({
  projectIdOrKey: z.string().describe('The JIRA project ID or key to get issue types for. Example: "IDS" or "10000"'),
  maxResults: z.number().optional().default(50).describe('Maximum number of results to return as a number (default: 50). Must be a number, not a string.'),
  startAt: z.number().optional().default(0).describe('Starting index for pagination as a number (default: 0). Must be a number, not a string.')
});

const GetIssueTypeFieldsSchema = z.object({
  projectIdOrKey: z.string().describe('The JIRA project ID or key. Example: "IDS" or "10000"'),
  issueTypeId: z.string().describe('The issue type ID to get fields for. Example: "10001"'),
  maxResults: z.number().optional().default(50).describe('Maximum number of results to return as a number (default: 50). Must be a number, not a string.'),
  startAt: z.number().optional().default(0).describe('Starting index for pagination as a number (default: 0). Must be a number, not a string.')
});

const GetIssueFieldNamesSchema = z.object({
  issueIdOrKey: z.string().describe('The JIRA issue ID or key to get field names for. Example: "IDS-10194" or "PROJ-123"')
});

const SearchIssueFieldsSchema = z.object({
  issueIdOrKey: z.string().describe('The JIRA issue ID or key to search fields for. Example: "IDS-10194" or "PROJ-123"'),
  searchTerms: z.array(z.string()).describe('Array of search terms to match against field names. Example: ["test", "story points"]. Partial matches are supported.')
});

export const fieldTools = {
  jira_get_issue_types: {
    description: 'Get all issue types available for a specific project. Returns issue type metadata including IDs and names. Use this to discover what issue types exist in a project before querying for their specific fields.',
    inputSchema: GetIssueTypesSchema,
    handler: async (client: JiraClient, input: z.infer<typeof GetIssueTypesSchema>) => {
      try {
        const result = await client.getIssueTypesForProject(input.projectIdOrKey, {
          startAt: input.startAt,
          maxResults: input.maxResults
        });

        return {
          success: true,
          data: {
            total: result.total,
            startAt: result.startAt,
            maxResults: result.maxResults,
            isLast: result.isLast,
            issueTypes: result.values.map(issueType => ({
              id: issueType.id,
              name: issueType.name,
              description: issueType.description,
              subtask: issueType.subtask,
              iconUrl: issueType.iconUrl
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

  jira_get_issue_type_fields: {
    description: 'Get all fields available for a specific issue type in a project. Returns detailed field metadata including which fields are required, their types, allowed values, and default values. Use this to understand what fields can be queried or set for a specific issue type.',
    inputSchema: GetIssueTypeFieldsSchema,
    handler: async (client: JiraClient, input: z.infer<typeof GetIssueTypeFieldsSchema>) => {
      try {
        const result = await client.getIssueTypeFields(
          input.projectIdOrKey,
          input.issueTypeId,
          {
            startAt: input.startAt,
            maxResults: input.maxResults
          }
        );

        // Convert fields object to array for easier consumption
        const fieldsArray = result.fields
          ? Object.entries(result.fields).map(([key, field]) => ({
              key,
              name: field.name,
              required: field.required,
              schema: {
                type: field.schema.type,
                items: field.schema.items,
                system: field.schema.system,
                custom: field.schema.custom,
                customId: field.schema.customId
              },
              hasDefaultValue: field.hasDefaultValue,
              operations: field.operations,
              allowedValues: field.allowedValues,
              autoCompleteUrl: field.autoCompleteUrl
            }))
          : [];

        return {
          success: true,
          data: {
            issueType: {
              id: result.id,
              name: result.name,
              description: result.description,
              subtask: result.subtask
            },
            fields: fieldsArray,
            totalFields: fieldsArray.length
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

  jira_get_issue_field_names: {
    description: 'Get all field IDs and their corresponding names for a specific JIRA issue. This tool retrieves the editmeta for an issue and returns a simplified list of field IDs (like "customfield_25931") mapped to their human-readable names (like "Target start"). Use this when you need to discover what fields are available for a specific issue.',
    inputSchema: GetIssueFieldNamesSchema,
    handler: async (client: JiraClient, input: z.infer<typeof GetIssueFieldNamesSchema>) => {
      try {
        const result = await client.getIssueEditMeta(input.issueIdOrKey);

        // Extract field IDs and names
        const fields = Object.entries(result.fields).map(([fieldId, field]) => ({
          fieldId,
          name: field.name,
          required: field.required,
          type: field.schema.type,
          custom: field.schema.custom !== undefined
        }));

        return {
          success: true,
          data: {
            issueKey: input.issueIdOrKey,
            totalFields: fields.length,
            fields: fields.sort((a, b) => a.name.localeCompare(b.name))
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

  jira_search_issue_fields: {
    description: 'Search for specific fields by name in a JIRA issue. Provide an issue key and one or more search terms, and this tool will return matching field IDs and names. Supports partial/fuzzy matching - for example, searching for "test" will match "Task Test Procedure". Use this when you need to find the field ID for a specific field name.',
    inputSchema: SearchIssueFieldsSchema,
    handler: async (client: JiraClient, input: z.infer<typeof SearchIssueFieldsSchema>) => {
      try {
        const result = await client.getIssueEditMeta(input.issueIdOrKey);

        // Search for fields matching any of the search terms (case-insensitive, partial match)
        const matchedFields: Array<{
          fieldId: string;
          name: string;
          matchedTerm: string;
          required: boolean;
          type: string;
          custom: boolean;
        }> = [];

        for (const [fieldId, field] of Object.entries(result.fields)) {
          for (const searchTerm of input.searchTerms) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const lowerFieldName = field.name.toLowerCase();

            if (lowerFieldName.includes(lowerSearchTerm)) {
              matchedFields.push({
                fieldId,
                name: field.name,
                matchedTerm: searchTerm,
                required: field.required,
                type: field.schema.type,
                custom: field.schema.custom !== undefined
              });
              break; // Don't add the same field multiple times if it matches multiple terms
            }
          }
        }

        return {
          success: true,
          data: {
            issueKey: input.issueIdOrKey,
            searchTerms: input.searchTerms,
            totalMatches: matchedFields.length,
            matches: matchedFields.sort((a, b) => a.name.localeCompare(b.name))
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
