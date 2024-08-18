//const require = createRequire(import.meta.url); 

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, './public')));
console.log(path.join(__dirname, './public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin@123',
    database: 'movie_night_organizer'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('MySQL connected...');
});

// Register user
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) throw err;
        res.json({ message: 'User registered successfully' });
    });
});

// Login user
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
        res.json({ token });
    });
});

// Add movie
app.post('/api/movies', (req, res) => {
    const { title, genre, release_year, description, poster_url } = req.body;
    const sql = 'INSERT INTO movies (title, genre, release_year, description, poster_url) VALUES (?, ?, ?, ?, ?)';

    db.query(sql, [title, genre, release_year, description, poster_url], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Movie added successfully' });
    });
});

// Fetch list of movies
app.get('/api/movies', (req, res) => {
    const sql = 'SELECT * FROM movies';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json({ movies: results });
    });
});

// Fetch list of users
app.get('/users', (req, res) => {
    const sql = 'SELECT id, username, email FROM users';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Create event
app.post('/api/events', (req, res) => {
    const { user_id, movie_id, event_date, location } = req.body;
    const sql = 'INSERT INTO events (user_id, movie_id, event_date, location) VALUES (?, ?, ?, ?)';

    db.query(sql, [user_id, movie_id, event_date, location], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Event created successfully' });
    });
});

// Handle RSVP submission
app.post('/api/rsvps', (req, res) => {
    const { event_id, user_id, rsvp_status } = req.body;
    const sql = 'INSERT INTO rsvps (event_id, user_id, rsvp_status) VALUES (?, ?, ?)';

    db.query(sql, [event_id, user_id, rsvp_status], (err, result) => {
        if (err) throw err;
        res.json({ message: 'RSVP submitted successfully' });
    });
});

// Add comment
app.post('/api/comments', (req, res) => {
    const { movie_id, user_id, comment } = req.body;
    const sql = 'INSERT INTO comments (movie_id, user_id, comment) VALUES (?, ?, ?)';

    db.query(sql, [movie_id, user_id, comment], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Comment added successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
