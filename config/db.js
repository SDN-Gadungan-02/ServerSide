import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
});

async function testConnection() {
    try {
        const client = await db.connect();
        console.log('✅ PostgreSQL connected successfully');
        client.release();
    } catch (err) {
        console.error('❌ PostgreSQL connection error:', err);
        process.exit(1); // Keluar aplikasi jika koneksi gagal
    }
}

testConnection();


export default db;