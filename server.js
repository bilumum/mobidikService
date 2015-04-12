var express = require('express'),
    //wines = require('./routes/employee');
    mobidik = require('./routes/mobidik');
     //logon = require('./routes/logon');
 
var app = express();
var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//app.get('/employees/:id/reports', wines.findByManager);
//app.get('/employees/:id', wines.findById);
//app.get('/employees', wines.findAll);
//app.get('/employees/:userName/:password', wines.performLogon);

//app.get('/Logon/:userName/:password', mobidik.performLogon);
app.get('/FindWord/:userId/:count', mobidik.findRandom);

app.post('/Logon', mobidik.performLogon);
app.post('/AddWord', mobidik.addNewWord);

app.listen(3000);
console.log('Listening on port 3000...');