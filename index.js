const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
const cors = require('cors');
const postRoutes = require('./routes/post_routes');
const getRoutes = require('./routes/get_routes');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const setupSocket = require('./socket');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
require('./database/db_connection');

// app.use(helmet());

// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100
// });

// app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));

app.use('/', express.static('public'));
app.use('/api', postRoutes);
app.use('/api', getRoutes);

app.get('/', (_, res) => {
  res.send('Hello World from Doux Event App');
});

const server = createServer(app);
setupSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});