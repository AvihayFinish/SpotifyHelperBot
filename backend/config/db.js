import Pool from 'pg-pool';

const pool = new Pool({
  user: 'spotify_user',
  password: 'spotify',
  host: 'localhost',
  port: 5432,
  database: 'spotify_helper'
});

export default pool;