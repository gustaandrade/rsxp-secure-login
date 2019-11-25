const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const LoginController = require('./lib/controllers/login.js');
const DashboardController = require('./lib/controllers/dashboard.js');

const app = express();
const router = express.Router();

app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type:', 'Authorization'],
  maxAge: '100'
}));

app.use(bodyParser.json());
app.use(router);

router.post('/login', LoginController.emailLogin);
router.post('/verify-2fa', LoginController.verify2FA);
router.get('/dashboard', DashboardController.get);

const server = app.listen(3001, () => {
  console.log(`Server running on port: ${server.address().port}`);
});
