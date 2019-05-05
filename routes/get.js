const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const pagination = require('pagination');

//https://github.com/jonschlinkert/remarkable
//マークダウン　html 変換
const Remarkable = require('remarkable');
// This values are default
const md = new Remarkable();


const settings = require('../settings');

const router = express.Router();

//カテゴリミドルウェア 
router.use((req, res, next) => {
    const db = new sqlite3.Database(settings.DBPATH);
    sql = `SELECT * FROM cate ORDER by name;`;
    db.all(sql, [], (err, rows) => {
        if (!err) {
            req.middleCate = rows;
        } else {
            console.log(err);
        }
    });
    db.close(() => {
        next();
    });
});


//トップページ
router.get('/', function (req, res) {

    let page = req.query.p;
    page = (page === undefined) ? 1 : parseInt(page);
    if (page < 1 || isNaN(page)) {
        page = 1;
    }

    const db = new sqlite3.Database(settings.DBPATH);

    let sql = `SELECT count(id) c FROM memo;`;

    db.get(sql, [], (err, rows) => {
        if (!err) {
            paginator = new pagination.SearchPaginator({
                prelink: '/',
                current: page,
                rowsPerPage: settings.RowsPerPage,
                totalResult: rows.c
            });

            const pageData = paginator.getPaginationData();

            sql = `SELECT m.id, m.cate_id, c.name, m.title, m.attention 
  FROM memo m LEFT OUTER JOIN cate c ON m.cate_id = c.id
  ORDER BY m.id DESC LIMIT ? , ? ;`;

            db.all(sql, [pageData.fromResult - 1, settings.RowsPerPage], (err, rows) => {
                if (!err) {
                    res.render('index', {
                        title: 'メモ (Express版)',
                        lst: rows,
                        page: pageData,
                        cate_list: req.middleCate,
                        cate_id: "",
                        q: ""
                    });
                } else {
                    res.status(404).send('<h1>404 Not Found</h1>');
                }
            });
        } else {
            res.status(404).send('<h1>404 Not Found</h1>');
        }
    });
    db.close();
});

//検索　キーワード
router.get('/search/', function (req, res) {

    let page = req.query.p;
    page = (page === undefined) ? 1 : parseInt(page);
    if (page < 1 || isNaN(page)) {
        page = 1;
    }

    const word = req.query.q;

    const db = new sqlite3.Database(settings.DBPATH);

    let sql = `SELECT count(id) c FROM memo WHERE title LIKE ? OR detail LIKE ?;`;

    db.get(sql, [`%${word}%`, `%${word}%`], (err, rows) => {
        if (!err && rows.c > 0) {
            paginator = new pagination.SearchPaginator({
                prelink: `/search/`,
                current: page,
                rowsPerPage: settings.RowsPerPage,
                totalResult: rows.c
            });

            const pageData = paginator.getPaginationData();

            sql = `SELECT m.id, m.cate_id, c.name, m.title, m.attention 
  FROM memo m LEFT OUTER JOIN cate c ON m.cate_id = c.id
  WHERE title LIKE ? OR detail LIKE ?
  ORDER BY m.id DESC LIMIT ? , ? ;`;

            db.all(sql, [`%${word}%`, `%${word}%`, pageData.fromResult - 1, settings.RowsPerPage], (err, rows) => {
                if (!err) {
                    res.render('index', {
                        title: word,
                        lst: rows,
                        page: pageData,
                        cate_list: req.middleCate,
                        cate_id: "",
                        q: word
                    });
                } else {
                    res.status(404).send('<h1>404 Not Found</h1>');
                }
            });
        } else {
            res.status(404).send('<h1>404 Not Found</h1>');
        }
    });
    db.close();
});

//検索　カテゴリ　キーワード
router.get('/search/:id', function (req, res) {

    let page = req.query.p;
    page = (page === undefined) ? 1 : parseInt(page);
    if (page < 1 || isNaN(page)) {
        page = 1;
    }

    const word = req.query.q;

    const cateId = parseInt(req.params.id);

    const db = new sqlite3.Database(settings.DBPATH);

    let sql = "";
    let pf = [];

    if (word) {
        sql = `SELECT count(id) c FROM memo WHERE cate_id = ? AND (title LIKE ? OR detail LIKE ?);`;
        pf = [cateId, `%${word}%`, `%${word}%`];
    } else {
        sql = `SELECT count(id) c FROM memo WHERE cate_id = ?;`;
        pf = [cateId];
    }

    db.get(sql, pf, (err, rows) => {
        if (!err && rows.c > 0) {
            paginator = new pagination.SearchPaginator({
                prelink: `/search/${cateId}`,
                current: page,
                rowsPerPage: settings.RowsPerPage,
                totalResult: rows.c
            });

            const pageData = paginator.getPaginationData();

            if (word) {
                sql = `SELECT m.id, m.cate_id, c.name, m.title, m.attention 
  FROM memo m LEFT OUTER JOIN cate c ON m.cate_id = c.id
  WHERE m.cate_id = ? AND (title LIKE ? OR detail LIKE ? )
  ORDER BY m.id DESC LIMIT ? , ? ;`;
                pf = [cateId, `%${word}%`, `%${word}%`, pageData.fromResult - 1, settings.RowsPerPage];
            } else {
                sql = `SELECT m.id, m.cate_id, c.name, m.title, m.attention 
  FROM memo m LEFT OUTER JOIN cate c ON m.cate_id = c.id
  WHERE m.cate_id = ?
  ORDER BY m.id DESC LIMIT ? , ? ;`;

                pf = [cateId, pageData.fromResult - 1, settings.RowsPerPage];
            }

            db.all(sql, pf, (err, rows) => {
                if (!err) {
                    res.render('index', {
                        title: rows[0].name,
                        lst: rows,
                        page: pageData,
                        cate_list: req.middleCate,
                        cate_id: cateId,
                        q: word
                    });
                } else {
                    res.status(404).send('<h1>404 Not Found</h1>');
                }
            });
        } else {
            res.status(404).send('<h1>404 Not Found</h1>');
        }
    });
    db.close();
});

//詳細ページ新規追加フォーム
router.get('/detail/insert', (req, res) => {
    res.render('insert_form', {
        title: "新規追加",
        cate_list: req.middleCate,
        cate_id: ""
    });
});

//詳細ページ
router.get('/detail/:id', (req, res) => {
    const db = new sqlite3.Database(settings.DBPATH);
    const sql = `SELECT m.id, m.cate_id, c.name, m.title, m.detail, m.attention
FROM memo m LEFT OUTER JOIN cate c ON m.cate_id = c.id WHERE m.id = ?;`;
    db.get(sql, [parseInt(req.params.id)], (err, row) => {
        row.detail = md.render(row.detail);
        if (!err) {
            row.attention = row.attention * 10;
            res.render('detail', {
                title: row.title,
                obj: row,
                cate_list: req.middleCate,
                cate_id: ""
            });
        } else {
            console.error(err.stack);
            res.status(500).send('<h1>/detail/ 500 Internal Server Error</h1>');
        }
    });
    db.close();
});

//詳細ページ編集フォーム
router.get('/detail/:id/form', (req, res) => {
    const db = new sqlite3.Database(settings.DBPATH);
    const sql = `SELECT m.id, m.cate_id, c.name, m.title, m.detail, m.attention
FROM memo m LEFT OUTER JOIN cate c ON m.cate_id = c.id WHERE m.id = ?;`;
    db.get(sql, [parseInt(req.params.id)], (err, row) => {
        if (!err) {
            res.render('detail_form', {
                title: row.title,
                obj: row,
                cate_list: req.middleCate,
                cate_id: ""
            });
        } else {
            console.error(err.stack);
            res.status(500).send('<h1>/detail/ 500 Internal Server Error</h1>');
        }
    });
    db.close();
});

//カテゴリ一覧
router.get('/cate', (req, res) => {
    const db = new sqlite3.Database(settings.DBPATH);
    const sql = `SELECT * FROM cate;`;
    db.all(sql, [], (err, rows) => {
        if (!err) {
            res.render('cate', {
                title: 'カテゴリ編集',
                lst: rows,
                cate_list: req.middleCate,
                cate_id: "",
                q: ""
            });
        } else {
            console.error(err.stack);
            res.status(500).send('<h1>/cate 500 Internal Server Error</h1>');
        }
    });
    db.close();
});

module.exports = router;