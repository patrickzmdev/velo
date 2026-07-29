import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Carrega o .env antes de montar a config: o reporter do TestDino lê
 * TESTDINO_TOKEN no momento em que este arquivo é avaliado, ou seja, antes do
 * globalSetup. Sem isso o token só existiria em CI, nunca localmente.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  //tempo maximo por teste
  timeout: 60000,

  //expect para asserções (expect toBeVisible)
  expect: {
    timeout: 5000,
  },

  testDir: './playwright/e2e',
  /* Semeia os pedidos de teste no banco (via Kysely) antes de rodar a suíte */
  globalSetup: './playwright/support/database/global.setup.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters
   * TestDino faz streaming em tempo real (não existe passo de upload no v2);
   * o html fica como cópia local/artefato do CI caso o dashboard esteja fora. */
  reporter: [
    ['@testdino/playwright', { token: process.env.TESTDINO_TOKEN }],
    ['html', { open: 'never' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`.
     * No CI, BASE_URL recebe a URL do deploy preview gerado no pipeline. */
    baseURL: process.env.BASE_URL || 'https://velo-dun.vercel.app',

    /* Fuso e locale fixos: a aplicação formata datas com toLocaleDateString('pt-BR'),
     * que usa o fuso do navegador. Sem fixar, o resultado muda entre a máquina local
     * (UTC-3) e o runner do CI (UTC), quebrando pedidos criados perto da meia-noite. */
    timezoneId: 'America/Sao_Paulo',
    locale: 'pt-BR',

    /* Deploys de preview da Vercel são protegidos por autenticação (SSO).
     * O bypass de automação libera o acesso via header, sem expor o preview. */
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? {
          'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
          'x-vercel-set-bypass-cookie': 'true',
        }
      : {},

    /* Evidência de falha. O TestDino publica apenas o que o Playwright gerar,
     * então trace/vídeo/screenshot são o que torna a triagem possível no painel.
     * See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',

    //tempo máximo para ações interativas como click, fill
    actionTimeout: 5000,

    //tempo máximo para navegações
    navigationTimeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests.
   * No CI os testes rodam contra o deploy preview, então não subimos o dev server. */
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
      },
});
