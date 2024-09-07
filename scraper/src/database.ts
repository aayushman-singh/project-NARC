import pg from 'pg';
const { Pool } = pg;
// Set up the connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: 'secret',
    port: 5432,
});

// Function to insert data
export const insertPost = async (imageUrl: string, altText: string, comments: string[]) => {
    const client = await pool.connect();
    try {
        await client.query(`
            INSERT INTO instagram_posts (image_url, alt_text, comments)
            VALUES ($1, $2, $3);
        `, [imageUrl, altText, comments]);
    } finally {
        client.release();
    }
};

// Function to fetch data
export const fetchPosts = async () => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM instagram_posts');
        return result.rows;
    } finally {
        client.release();
    }
};
