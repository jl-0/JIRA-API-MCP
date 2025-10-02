import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { JiraClient } from './client/JiraClient.js';
import { JiraConfig } from './client/types.js';
import { issueTools } from './tools/issues.js';
import { projectTools } from './tools/projects.js';
import { userTools } from './tools/users.js';
import { fieldTools } from './tools/fields.js';

const ConfigSchema = z.object({
  baseUrl: z.string().url().describe('JIRA instance base URL'),
  apiToken: z.string().describe('JIRA API token (Personal Access Token)'),
  maxResults: z.number().optional().default(50).describe('Default max results per request'),
  timeout: z.number().optional().default(30000).describe('Request timeout in milliseconds')
});

export class JiraMCPServer {
  private server: Server;
  private client: JiraClient | null = null;
  private tools: Record<string, any> = {};

  constructor() {
    this.server = new Server(
      {
        name: 'jira-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.initializeTools();
  }

  private initializeTools() {
    this.tools = {
      ...issueTools,
      ...projectTools,
      ...userTools,
      ...fieldTools
    };
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const toolList: Tool[] = Object.entries(this.tools).map(([name, tool]) => {
        // Convert Zod schema to JSON Schema format with proper type information
        const jsonSchema = zodToJsonSchema(tool.inputSchema, {
          target: 'openApi3',
          $refStrategy: 'none'
        }) as any;

        // Ensure the schema has the correct structure for MCP
        return {
          name,
          description: tool.description,
          inputSchema: {
            type: 'object' as const,
            properties: jsonSchema.properties || {},
            required: jsonSchema.required || []
          }
        };
      });

      return {
        tools: toolList
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const tool = this.tools[name];
      if (!tool) {
        throw new Error(`Tool "${name}" not found`);
      }

      if (!this.client) {
        throw new Error('JIRA client not initialized. Please configure with valid credentials.');
      }

      try {
        const validatedArgs = tool.inputSchema.parse(args);
        const result = await tool.handler(this.client, validatedArgs);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: 'Invalid arguments',
                  details: error.errors
                }, null, 2)
              }
            ]
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
              }, null, 2)
            }
          ]
        };
      }
    });
  }

  public async connect(transport: any) {
    const config = await this.loadConfig();

    if (config) {
      try {
        this.client = new JiraClient(config);
        console.error('JIRA client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize JIRA client:', error);
      }
    } else {
      console.error('Warning: JIRA configuration not found. Some features may be unavailable.');
    }

    await this.server.connect(transport);
  }

  private async loadConfig(): Promise<JiraConfig | null> {
    // Try to load from environment variables
    const baseUrl = process.env.JIRA_BASE_URL;
    const apiToken = process.env.JIRA_API_TOKEN;

    if (baseUrl && apiToken) {
      try {
        const config = ConfigSchema.parse({
          baseUrl,
          apiToken,
          maxResults: process.env.JIRA_MAX_RESULTS ? parseInt(process.env.JIRA_MAX_RESULTS, 10) : 50,
          timeout: process.env.JIRA_TIMEOUT ? parseInt(process.env.JIRA_TIMEOUT, 10) : 30000
        });
        return config;
      } catch (error) {
        console.error('Invalid configuration:', error);
        return null;
      }
    }

    // Try to load from .env file
    try {
      const dotenv = await import('dotenv');
      dotenv.config();

      const envBaseUrl = process.env.JIRA_BASE_URL;
      const envApiToken = process.env.JIRA_API_TOKEN;

      if (envBaseUrl && envApiToken) {
        const config = ConfigSchema.parse({
          baseUrl: envBaseUrl,
          apiToken: envApiToken,
          maxResults: process.env.JIRA_MAX_RESULTS ? parseInt(process.env.JIRA_MAX_RESULTS, 10) : 50,
          timeout: process.env.JIRA_TIMEOUT ? parseInt(process.env.JIRA_TIMEOUT, 10) : 30000
        });
        return config;
      }
    } catch (error) {
      // dotenv not available or failed to load
    }

    return null;
  }
}