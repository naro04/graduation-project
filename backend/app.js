const express = require("express");
const routes = require('./routes');

const app = express();

// app.use(compression());
// app.disable('x-powered-by');
app.set('port', process.env.PORT || 5000);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/', routes);


module.exports = app;
