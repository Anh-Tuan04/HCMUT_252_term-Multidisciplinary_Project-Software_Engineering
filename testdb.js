import db from './config/db.js';

async function test() {
  try {
    const [rows] = await db.execute('SELECT * FROM parking_slots');
    console.log(rows);
  } catch (err) {
    console.error(err);
  }
}

test();