import { existsSync } from 'node:fs'

export async function launchBrowser() {
  if (process.env.VERCEL) {
    const [{ chromium }, sparticuzChromium] = await Promise.all([
      import('playwright-core'),
      import('@sparticuz/chromium').then((m) => m.default),
    ])
    return chromium.launch({
      args: sparticuzChromium.args,
      executablePath: await sparticuzChromium.executablePath(),
      headless: true,
    })
  }
  const { chromium } = await import('playwright')
  const localExecutable = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].find((executablePath) => executablePath && existsSync(executablePath))

  return chromium.launch(localExecutable ? { executablePath: localExecutable } : undefined)
}

