var express = require('express');
var serveStatic = require('serve-static');

var app = express();

app.use('/midi', serveStatic('client'));
app.use(serveStatic('client'));

app.listen(process.env.PORT || 8000);
