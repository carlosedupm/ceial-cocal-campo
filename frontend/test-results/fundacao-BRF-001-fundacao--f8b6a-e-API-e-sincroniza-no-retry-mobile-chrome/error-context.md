# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fundacao.spec.ts >> BRF-001 fundacao >> preserva fila local em falha de API e sincroniza no retry
- Location: e2e/fundacao.spec.ts:48:3

# Error details

```
Error: browserType.launch: Executable doesn't exist at /tmp/cursor-sandbox-cache/9c861d82d8742f96b89120af5864c8bb/playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```