// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express');
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const auth = require('./middlewares/auth');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const { createUser, login } = require('./controllers/users');

const ERROR_CODE_NOT_FOUND = 404;

const app = express();
const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/', express.json());
app.use('/users', auth, usersRouter);
app.use('/cards', auth, cardsRouter);

app.post('/signin', login);
app.post('/signup', createUser);

app.use('*', auth, (req, res) => {
  res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Not Found' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
