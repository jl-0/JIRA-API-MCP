# NPM Scripts Reference

Quick reference for all available npm scripts in the JIRA MCP Server project.

## Development Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `tsx src/index.ts` | Run server in development mode with TypeScript |
| `npm run build` | `tsc` | Compile TypeScript to JavaScript |
| `npm start` | `node dist/index.js` | Run compiled server |
| `npm run clean` | `rm -rf dist` | Clean build directory |

## Testing Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm test` | `jest` | Run all test suites |
| `npm run test:direct` | `jest src/__tests__/tools-direct.test.ts` | Run direct tool integration tests |
| `npm run test:generate-docs` | `tsx src/__tests__/generate-mcp-docs.ts` | Generate documentation from test responses |

## Inspector Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run inspect` | `npx -y @modelcontextprotocol/inspector tsx src/index.ts` | Launch MCP Inspector with TypeScript source |
| `npm run inspect:built` | `npm run build && npx -y @modelcontextprotocol/inspector node dist/index.js` | Build and launch Inspector with compiled JS |

## Code Quality Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run lint` | `eslint src/**/*.ts` | Lint TypeScript files |
| `npm run format` | `prettier --write src/**/*.ts` | Format code with Prettier |

## Common Workflows

### Development Workflow
```bash
# 1. Start development
npm run dev

# 2. Test with inspector
npm run inspect

# 3. Run tests
npm test

# 4. Lint and format
npm run lint
npm run format

# 5. Build for production
npm run build
```

### Testing Workflow
```bash
# 1. Run integration tests
npm run test:direct

# 2. Generate documentation
npm run test:generate-docs

# 3. Review test outputs
ls -la __tool_response_logs__/
```

### Debugging Workflow
```bash
# 1. Launch inspector
npm run inspect

# 2. Test specific tool in browser
# 3. Check terminal for server logs
# 4. Update code and rebuild
npm run build

# 5. Re-test with inspector
npm run inspect:built
```

## Environment Setup

Before running any scripts, ensure your `.env` file is configured:

```env
JIRA_BASE_URL=https://your-instance.atlassian.net
JIRA_API_TOKEN=your-api-token
JIRA_TIMEOUT=30000
```

## Quick Tips

1. **Inspector URL**: The inspector typically opens at `http://localhost:6274`
2. **Test Logs**: Response logs are saved to `__tool_response_logs__/`
3. **Build Output**: Compiled JavaScript is in `dist/`
4. **Documentation**: Generated docs are in `MCP_TOOL_DOCUMENTATION.md`

## Troubleshooting

### Inspector won't start
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Tests failing
```bash
# Check environment variables
cat .env

# Run specific test with verbose output
npm test -- --verbose src/__tests__/tools-direct.test.ts
```

### Build errors
```bash
# Clean and rebuild
npm run clean
npm run build
```