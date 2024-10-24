const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(cors());

// PostgreSQL client setup
const client = new Client({
    user: 'explorer_user',
    host: 'db',
    database: 'bitcoin_explorer',
    password: 'securepassword',
    port: 5432,
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error', err));

// API endpoint to get the latest block height
app.get('/api/block_height', async (req, res) => {
    try {
        const result = await client.query(
            'SELECT height FROM block_height ORDER BY id DESC LIMIT 1'
        );
        if (result.rows.length > 0) {
            res.json({ latest_height: result.rows[0].height });
        } else {
            res.json({ latest_height: null });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
});
