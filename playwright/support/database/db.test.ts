// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { assertPreviewDatabase } from './db';

/**
 * O guard é a última barreira antes de um DELETE em produção. Os casos abaixo
 * cobrem cada caminho de decisão, sem depender de nenhum banco real.
 */

// Refs fictícios de propósito: o guard só compara strings, então o teste não
// precisa — nem deve — carregar os identificadores reais dos ambientes.
const PREVIEW_REF = 'abcdefghijklmnopqrst';
const PROD_REF = 'zyxwvutsrqponmlkjihg';

const previewUrl = `postgresql://postgres.${PREVIEW_REF}:senha@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`;
const prodUrl = `postgresql://postgres.${PROD_REF}:senha@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`;

let envBackup: NodeJS.ProcessEnv;

beforeEach(() => {
  envBackup = { ...process.env };
  delete process.env.SUPABASE_PROJECT_REF_PREVIEW;
  delete process.env.SUPABASE_PROJECT_REF_PROD;
});

afterEach(() => {
  process.env = envBackup;
});

describe('assertPreviewDatabase', () => {
  it('libera a connection string do projeto de preview', () => {
    process.env.SUPABASE_PROJECT_REF_PREVIEW = PREVIEW_REF;

    expect(() => assertPreviewDatabase(previewUrl)).not.toThrow();
  });

  it('bloqueia a connection string de produção', () => {
    process.env.SUPABASE_PROJECT_REF_PREVIEW = PREVIEW_REF;
    process.env.SUPABASE_PROJECT_REF_PROD = PROD_REF;

    expect(() => assertPreviewDatabase(prodUrl)).toThrow(/PRODUÇÃO/);
  });

  it('bloqueia um projeto desconhecido, mesmo sem o ref de produção configurado', () => {
    process.env.SUPABASE_PROJECT_REF_PREVIEW = PREVIEW_REF;

    expect(() => assertPreviewDatabase(prodUrl)).toThrow(/não aponta para o projeto Supabase de preview/);
  });

  it('falha fechado quando o ref de preview não está definido', () => {
    expect(() => assertPreviewDatabase(previewUrl)).toThrow(/SUPABASE_PROJECT_REF_PREVIEW não definida/);
  });

  it('libera o banco local do supabase start', () => {
    expect(() =>
      assertPreviewDatabase('postgresql://postgres:postgres@127.0.0.1:54322/postgres'),
    ).not.toThrow();
  });

  it('protege mesmo quando a URL não é parseável (senha com caractere especial)', () => {
    process.env.SUPABASE_PROJECT_REF_PREVIEW = PREVIEW_REF;

    // A senha com '[' quebra o parsing da URL; a verificação por substring
    // continua valendo e o ref de preview ausente precisa barrar a conexão.
    expect(() =>
      assertPreviewDatabase('postgresql://postgres.outroprojeto:se[nha@host:5432/postgres'),
    ).toThrow(/não aponta para o projeto Supabase de preview/);
  });
});
