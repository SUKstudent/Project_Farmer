
const express = require('express');
const cors = require('cors');

const chatRoute = require('./routes/chat');
const analyzeRoute = require('./routes/analyze');
const uploadRoute = require('./routes/upload');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoute);
app.use('/api/analyze', analyzeRoute);
app.use('/api/upload', uploadRoute);

app.listen(5000, () => console.log('Server running on 5000'));
