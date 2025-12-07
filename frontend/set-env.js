const fs = require('fs');
const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${process.env['NG_APP_API_URL'] || 'https://triumphant-adventure-production-4d3a.up.railway.app'}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`Environment file generated at ${targetPath}`);