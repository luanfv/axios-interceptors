import 'dotenv/config';

import express from 'express';
import { json } from 'body-parser';

const app = express();

app.use(json());

app.get(process.env.ROUTE_GET_AUTH, (req, res) => {
  try {
    const authorization = req.headers.authorization;
    const token = authorization.split(' ')[1];

    if (token !== process.env.TOKEN) {
      throw new Error();
    }

    res.json({
      message: 'authorized',
    });
  } catch {
    res.status(401).json({
      message: 'unauthorized',
    });
  }
});

app.post(process.env.ROUTE_POST_TODO, (req, res) => {
  try {
    const authorization = req.headers.authorization;
    const token = authorization.split(' ')[1];

    if (token !== process.env.TOKEN) {
      throw new Error();
    }

    const { task } = req.body;

    res.json({
      id: new Date().getTime(),
      task,
    });
  } catch {
    res.status(401).json({
      message: 'unauthorized',
    });
  }
});

app.post(process.env.ROUTE_POST_REFRESH_TOKEN, (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (refresh_token !== process.env.REFRESH_TOKEN) {
      throw new Error();
    }

    res.json({
      token: process.env.TOKEN,
    });
  } catch {
    res.status(404).json({
      message: 'refresh token does not exist',
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});
