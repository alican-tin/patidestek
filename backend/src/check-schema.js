const { DataSource } = require('typeorm');
require('dotenv').config();

async function checkSchema() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'patidestek',
  });
  
  await ds.initialize();
  
  const tables = await ds.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables:', tables.map(t => t.table_name));
  
  await ds.destroy();
}

checkSchema();
