import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from './schema';

/**
 * Instância única do Kysely conectada ao Postgres do Supabase.
 * A connection string vem de DATABASE_URL (ver .env).
 */
let db: Kysely<Database> | null = null;

export function getDb(): Kysely<Database> {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL não definida. Configure a connection string do Postgres/Supabase no arquivo .env.',
    );
  }

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
