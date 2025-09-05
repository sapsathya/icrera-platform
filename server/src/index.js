require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const filesRoutes = require('./routes/files');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/uploads', filesRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 4000;

// ensure default admin exists
const { ensureDefaultAdmin } = require('./utils/createDefaultAdmin');
ensureDefaultAdmin().catch(e=>console.error(e));

app.listen(PORT, () => console.log('Server running on port', PORT));