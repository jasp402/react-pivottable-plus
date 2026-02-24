import fs from 'fs';
import { execSync } from 'child_process';

const type = process.argv[2] || 'patch';
const validTypes = ['patch', 'minor', 'major'];

if (!validTypes.includes(type)) {
  console.log('⚠️ Tipo de incremento inválido. Usando "patch" por defecto.');
  process.exit(1);
}

try {
  execSync(`npm version ${type} --no-git-tag-version`);
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log("✅ Versión incrementada a: " + pkg.version);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
