const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Use the Railway PostgreSQL connection string
const pool = new Pool({
    connectionString: "postgresql://postgres:OeYvGnLhrZaHjsXWlSVYOtoAlckOyDdg@tramway.proxy.rlwy.net:57348/railway",
    ssl: {
        rejectUnauthorized: false,
    },
});

app.post('/apply', async (req, res) => {
    const { first_name, last_name, grade, address } = req.body;
    if (!first_name || !last_name || !grade || !address) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    
    try {
        const insertQuery =
            `INSERT INTO students (first_name, last_name, grade, address)
            VALUES ($1, $2, $3 , $4)`;

        const values = [
            first_name,
            last_name,
            grade,
            address,
        ];

        const result = await pool.query(insertQuery, values);

        console.log('Student apply:', result.rows[0]);

        res.status(201).json({ message: 'Student apply successfully!' });
    } catch (error) {
        console.error('Error applying user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const result = await pool.query(
            "SELECT * FROM students WHERE first_name ILIKE $1 OR last_name ILIKE $1", 
            [`%${name}%`]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Database error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 8080;  // Make sure this matches Railway's port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
