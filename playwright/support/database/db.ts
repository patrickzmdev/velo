import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from './schema';

/**
 * Instância única do Kysely conectada ao Postgres do Supabase.
 * A connection string vem de DATABASE_URL (ver .env).
 */
let db: Kysely<Database> | null = null;

/** Bancos locais (`supabase start`), onde não existe risco de tocar em produção. */
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];

/**
 * Extrai o host da connection string. Retorna null se a URL não for parseável
 * (por exemplo, senha com caracteres especiais não percent-encoded) — nesse caso
 * as demais verificações, que são por substring, continuam valendo.
 */
function extractHost(connectionString: string): string | null {
  try {
    return new URL(connectionString).hostname;
  } catch {
    return null;
  }
}

/**
 * Impede que a suíte abra conexão com qualquer banco que não seja o de preview.
 *
 * Motivo: o seed roda DELETE antes de inserir (ver cleanupTestOrders e
 * cleanupTestOrdersByCpf). Uma DATABASE_URL apontada para produção por engano
 * apagaria pedidos reais de clientes em silêncio, sem nenhum teste falhando.
 * A separação de ambientes é configuração — e configuração é trocada por engano.
 * Esta é a trava que transforma esse erro em falha ruidosa.
 *
 * Falha fechada de propósito: sem SUPABASE_PROJECT_REF_PREVIEW definida, nada
 * conecta. É preferível quebrar a suíte a rodá-la contra um alvo não verificado.
 *
 * Exportada para permitir teste direto, sem depender de um banco real.
 */
export function assertPreviewDatabase(connectionString: string): void {
  const host = extractHost(connectionString);

  // Banco local do desenvolvedor: nunca é produção, libera.
  if (host !== null && LOCAL_HOSTS.includes(host)) {
    return;
  }

  const prodRef = process.env.SUPABASE_PROJECT_REF_PROD?.trim();
  if (prodRef && connectionString.includes(prodRef)) {
    throw new Error(
      `DATABASE_URL aponta para o projeto Supabase de PRODUÇÃO (${prodRef}). ` +
        'A suíte apaga pedidos antes de semear a massa — conexão abortada. ' +
        'Use a connection string do projeto de preview.',
    );
  }

  const previewRef = process.env.SUPABASE_PROJECT_REF_PREVIEW?.trim();
  if (!previewRef) {
    throw new Error(
      'SUPABASE_PROJECT_REF_PREVIEW não definida — não é possível confirmar que a ' +
        'DATABASE_URL aponta para o banco de preview. Defina o project ref do ' +
        'Supabase de preview no .env (local) ou nas repository variables (CI).',
    );
  }

  if (!connectionString.includes(previewRef)) {
    throw new Error(
      `DATABASE_URL não aponta para o projeto Supabase de preview (${previewRef}). ` +
        `Host resolvido: ${host ?? 'não identificado'}. Conexão abortada para ` +
        'proteger os dados de produção.',
    );
  }
}

export function getDb(): Kysely<Database> {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL não definida. Configure a connection string do Postgres/Supabase no arquivo .env.',
    );
  }

  // Verificado aqui, e não no globalSetup, porque este é o único ponto por onde
  // toda conexão passa — inclusive as limpezas chamadas de dentro dos specs, que
  // o globalSetup não cobriria.
  assertPreviewDatabase(connectionString);

  db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString,
        // Supabase exige SSL; em pooler o certificado não é validado localmente.
        ssl: { rejectUnauthorized: false },
        max: 5,
      }),
    }),
  });

  return db;
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}
