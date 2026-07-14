import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis do .env (inclui DATABASE_URL) antes de conectar ao banco.
// O Playwright roda a partir da raiz do projeto, onde está o .env.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { seedTestOrders, cleanupTestOrders } from './seedOrders';
import { closeDb } from './db';

/**
 * globalSetup do Playwright: garante estado determinístico antes da suíte.
 * 1) Remove qualquer massa de teste anterior (aprovado, reprovado, em análise).
 * 2) Gera a massa nova, cada pedido no seu devido status.
 */
async function globalSetup() {
  try {
    await cleanupTestOrders();
    await seedTestOrders();
  } finally {
    // Fecha o pool usado só para o seed; os testes não acessam o banco diretamente.
    await closeDb();
  }
}

export default globalSetup;
