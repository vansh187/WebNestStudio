// WebNest AI for VS Code, published on the Visual Studio Marketplace. Installing it is free;
// using it needs a WebNest Prime pass, and it signs in through /vscode/connect.
// This version is Ask mode only: it never runs commands or changes files by itself, so copy on
// the site must not promise Agent mode in VS Code.
const EXTENSION_ID = 'webneststudio.webnest-ai'

export const VSCODE_EXTENSION = {
  name: 'WebNest AI for VS Code',
  id: EXTENSION_ID,
  marketplaceHref: `https://marketplace.visualstudio.com/items?itemName=${EXTENSION_ID}`,
  // Opens VS Code straight on the extension's page, for visitors who have it installed.
  installHref: `vscode:extension/${EXTENSION_ID}`,
  // Matches the extension's README; keep the two in step.
  features: [
    { title: 'Chat in the sidebar', text: 'Ask anything about your code without leaving the editor.' },
    { title: 'Explain or refactor', text: 'Right-click a selection, or use the lightbulb.' },
    { title: 'Fix errors', text: 'Choose Fix with WebNest AI on any red or yellow squiggle.' },
    { title: 'You approve every change', text: 'Apply shows the exact file and lines first. Nothing is sent but your message unless you switch it on.' },
  ],
}
