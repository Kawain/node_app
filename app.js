const express = require('express');
//const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

//const settings = require('./settings');
const app = express();

const getRouter = require('./routes/get');
const postRouter = require('./routes/post');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//ルーター
app.use('/', getRouter);
app.use('/post', postRouter);

//404
app.use((req, res, next) => {
    res.status(404).send('<h1>404 Not Found</h1>');
});

//エラー
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('<h1>top 500 Internal Server Error</h1>');
});


app.listen(3000, () => console.log('Memo app listening on port 3000!'));