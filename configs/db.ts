import { Pool } from 'pg';
import { config } from './config';

const poolConfig = {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
}

export const pool = new Pool(poolConfig);
