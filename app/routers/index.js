'use strict';
// const authRouter = require('./auth.router');
const operationRouter = require('./operation.router');
// const listRouter = require('./list.router');
// const profileRouter = require('./profile.router');
const NotificationRouter = require('./notification.router');

module.exports = (_app) => {
  // _app.use(authRouter);
  _app.use(operationRouter);
  // _app.use(listRouter);
  // _app.use(profileRouter);
  _app.use(NotificationRouter);
};
