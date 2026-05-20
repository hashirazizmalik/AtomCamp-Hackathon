require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middleware/cors');

const app = express();
app.use(corsMiddleware);
app.use(express.json());

app.use('/api/chat',  require('./routes/chat'));
app.use('/api/speak', require('./routes/speak'));
app.use('/api/alert', require('./routes/alert'));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'VitaVoice' }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🩺 VitaVoice server running on port ${PORT}`));
