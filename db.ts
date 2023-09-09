import { Pool, PoolConfig } from 'pg';
import { config } from './config/config';

const poolConfig: PoolConfig = {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
}

export const pool: Pool = new Pool(poolConfig);
