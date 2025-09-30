import * as fs from 'fs';
import * as path from 'path';

// Directories to read from
const TOOL_LOGS_DIR = path.join(process.cwd(), '__tool_response_logs__');
const MCP_LOGS_DIR = path.join(process.cwd(), '__mcp_response_logs__');
const OUTPUT_FILE = path.join(process.cwd(), 'MCP_RESPONSE_DOCUMENTATION.md');

interface ResponseExample {
  tool: string;
  test: string;
  request: any;
  response: any;
  timestamp: number;
}

function analyzeResponseStructure(obj: any, depth = 0): string {
  const indent = '  '.repeat(depth);
  let result = '';

  if (obj === null || obj === undefined) {
    return `${indent}${obj}\n`;
  }

  if (Array.isArray(obj)) {
    result += `${indent}Array[${obj.length}]\n`;
    if (obj.length > 0) {
      result += `${indent}  First item structure:\n`;
      result += analyzeResponseStructure(obj[0], depth + 2);
    }
    return result;
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    keys.forEach(key => {
      const value = obj[key];
      const valueType = Array.isArray(value) ? 'Array' : typeof value;

      if (valueType === 'object' && value !== null) {
        result += `${indent}${key}: {\n`;
        result += analyzeResponseStructure(value, depth + 1);
        result += `${indent}}\n`;
      } else if (valueType === 'Array') {
        result += `${indent}${key}: Array[${value.length}]\n`;
        if (value.length > 0 && typeof value[0] === 'object') {
          result += analyzeResponseStructure(value[0], depth + 1);
        }
      } else {
        result += `${indent}${key}: ${valueType}\n`;
      }
    });
    return result;
  }

  return `${indent}${typeof obj}\n`;
}

function generateDocumentation() {
  const examples: ResponseExample[] = [];

  // Read tool response logs
  if (fs.existsSync(TOOL_LOGS_DIR)) {
    const files = fs.readdirSync(TOOL_LOGS_DIR);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(TOOL_LOGS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        const [tool, ...testParts] = file.replace('.json', '').split('_');
        const test = testParts.slice(0, -1).join('_'); // Remove timestamp

        examples.push({
          tool,
          test,
          request: data.request || {},
          response: data,
          timestamp: parseInt(testParts[testParts.length - 1]) || Date.now()
        });
      }
    });
  }

  // Group examples by tool
  const toolExamples: { [key: string]: ResponseExample[] } = {};
  examples.forEach(example => {
    if (!toolExamples[example.tool]) {
      toolExamples[example.tool] = [];
    }
    toolExamples[example.tool].push(example);
  });

  // Generate markdown documentation
  let markdown = '# JIRA MCP Server - Response Documentation\n\n';
  markdown += 'This documentation is auto-generated from actual MCP server responses.\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += '## Table of Contents\n\n';

  const tools = Object.keys(toolExamples).sort();
  tools.forEach(tool => {
    markdown += `- [${tool}](#${tool.toLowerCase().replace(/_/g, '-')})\n`;
  });

  markdown += '\n---\n\n';

  // Document each tool
  tools.forEach(tool => {
    markdown += `## ${tool}\n\n`;

    const toolExs = toolExamples[tool];

    // Find the most complete example
    const primaryExample = toolExs[0];

    markdown += '### Response Structure\n\n';
    markdown += '```\n';
    markdown += analyzeResponseStructure(primaryExample.response);
    markdown += '```\n\n';

    markdown += '### Example Responses\n\n';

    toolExs.forEach(ex => {
      markdown += `#### Test: ${ex.test}\n\n`;

      // Show the response content if it has the MCP structure
      if (ex.response.content) {
        markdown += '**MCP Response Content:**\n\n';

        if (Array.isArray(ex.response.content)) {
          ex.response.content.forEach((item: any, idx: number) => {
            if (item.type === 'text') {
              markdown += '```json\n';

              // Try to parse and format JSON
              try {
                const parsed = JSON.parse(item.text);
                markdown += JSON.stringify(parsed, null, 2).substring(0, 2000);
                if (JSON.stringify(parsed).length > 2000) {
                  markdown += '\n... (truncated)';
                }
              } catch {
                markdown += item.text.substring(0, 2000);
                if (item.text.length > 2000) {
                  markdown += '\n... (truncated)';
                }
              }

              markdown += '\n```\n\n';
            }
          });
        } else {
          markdown += '```json\n';
          markdown += JSON.stringify(ex.response.content, null, 2).substring(0, 2000);
          markdown += '\n```\n\n';
        }
      } else {
        markdown += '**Raw Response:**\n\n';
        markdown += '```json\n';
        markdown += JSON.stringify(ex.response, null, 2).substring(0, 2000);
        if (JSON.stringify(ex.response).length > 2000) {
          markdown += '\n... (truncated)';
        }
        markdown += '\n```\n\n';
      }
    });

    markdown += '---\n\n';
  });

  // Add notes about response patterns
  markdown += '## Common Response Patterns\n\n';
  markdown += '### MCP Tool Response Structure\n\n';
  markdown += 'All MCP tool responses follow this structure:\n\n';
  markdown += '```typescript\n';
  markdown += 'interface MCPToolResponse {\n';
  markdown += '  content: Array<{\n';
  markdown += '    type: "text";\n';
  markdown += '    text: string; // Usually JSON stringified data\n';
  markdown += '  }>;\n';
  markdown += '}\n';
  markdown += '```\n\n';

  markdown += '### JIRA API Response Patterns\n\n';
  markdown += '1. **Search Results**: Include `issues` array, `total` count, and pagination info\n';
  markdown += '2. **Single Issue**: Contains `key`, `id`, `self` URL, and `fields` object\n';
  markdown += '3. **Comments**: Include `comments` array with `author`, `body`, and timestamps\n';
  markdown += '4. **Transitions**: List available workflow transitions with `id` and `name`\n';
  markdown += '5. **Projects**: Include `key`, `name`, `id`, and optional expanded fields\n\n';

  markdown += '### Error Handling\n\n';
  markdown += 'Errors typically return:\n';
  markdown += '- HTTP status codes (404 for not found, 400 for bad request)\n';
  markdown += '- Error messages in the response body\n';
  markdown += '- JQL validation errors for malformed queries\n\n';

  // Write the documentation
  fs.writeFileSync(OUTPUT_FILE, markdown);
  console.log(`\n✅ Documentation generated: ${OUTPUT_FILE}`);
}

// Run if called directly
if (require.main === module) {
  generateDocumentation();
}