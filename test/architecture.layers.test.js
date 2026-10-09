import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(projectRoot, 'src');

const javascriptFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? javascriptFiles(entryPath) : [entryPath];
    })
  );

  return nestedFiles.flat().filter((file) => file.endsWith('.js'));
};

const importsFrom = (source, segment) =>
  new RegExp(`from\\s+['\"][^'\"]*${segment}[^'\"]*['\"]`, 'u').test(source);

test('solo los DAO importan directamente los modelos de Mongoose', async () => {
  const files = await javascriptFiles(sourceRoot);

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (!importsFrom(source, '/models/') && !importsFrom(source, '../models/')) continue;

    const relativePath = path.relative(sourceRoot, file).replaceAll('\\', '/');
    assert.match(relativePath, /^dao\//u, `${relativePath} importa un modelo fuera de la capa DAO`);
  }
});

test('controllers y services respetan los límites de sus capas', async () => {
  const rules = [
    { directory: 'controllers', forbidden: ['/models/', '../models/', '/dao/', '../dao/', '/repositories/', '../repositories/'] },
    { directory: 'services', forbidden: ['/models/', '../models/', '/dao/', '../dao/'] },
    { directory: 'repositories', forbidden: ['/models/', '../models/'] }
  ];

  for (const rule of rules) {
    const files = await javascriptFiles(path.join(sourceRoot, rule.directory));

    for (const file of files) {
      const source = await readFile(file, 'utf8');
      for (const forbiddenImport of rule.forbidden) {
        assert.equal(
          importsFrom(source, forbiddenImport),
          false,
          `${path.relative(sourceRoot, file)} viola el límite de capas con ${forbiddenImport}`
        );
      }
    }
  }
});
