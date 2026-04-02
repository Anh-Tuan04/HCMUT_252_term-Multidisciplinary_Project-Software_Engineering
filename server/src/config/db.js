'use strict';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
});

const getConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Kết nối Database thành công!');
        connection.release();
    } catch (err) {
        console.error('Lỗi kết nối Database:', err.message);
        throw err;
    }
};

export { getConnection };
export default pool;