const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const settings = require('../settings');

const router = express.Router();

//メモ新規追加
router.post('/detail/insert', (req, res) => {
    //{ cate_id: '13', title: 'a', detail: 's', attention: '10' }
    const cate_id = parseInt(req.body.cate_id);
    const title = req.body.title;
    const detail = req.body.detail;
    const attention = parseInt(req.body.attention);

    const db = new sqlite3.Database(settings.DBPATH);
    const sql = `INSERT INTO memo (cate_id, title, detail, attention) VALUES( ?, ?, ?, ? );`;
    db.run(sql, [cate_id, title, detail, attention], (err) => {
        if (err) {
            console.error(err.stack);
            res.status(500).send('<h1>/insert 500 Internal Server Error</h1>');
        }
    });
    db.close(() => {
        res.redirect('/');
    });
});

//メモ更新・削除
router.post('/detail/update', (req, res) => {
    //{ id: '393', cate_id: '20', title: 'のーど', detail: '内容\r\n内容', attention: '10', update: '1' }
    const id = parseInt(req.body.id);
    const db = new sqlite3.Database(settings.DBPATH);
    let sql = ``;

    if (req.body.update) {
        const cate_id = parseInt(req.body.cate_id);
        const title = req.body.title;
        const detail = req.body.detail;
        const attention = parseInt(req.body.attention);
        sql = `UPDATE memo SET cate_id=?, title=?, detail=?, attention=? WHERE id=?;`;
        db.run(sql, [cate_id, title, detail, attention, id], (err) => {
            if (err) {
                console.error(err.stack);
                res.status(500).send('<h1>/insert 500 Internal Server Error</h1>');
            }
        });
        db.close(() => {
            res.redirect(`/detail/${id}`);
        });
    } else {
        sql = `DELETE FROM memo WHERE id=?;`;
        db.run(sql, [id], (err) => {
            if (err) {
                console.error(err.stack);
                res.status(500).send('<h1>/insert 500 Internal Server Error</h1>');
            }
        });
        db.close(() => {
            res.redirect(`/`);
        });
    }
});

//カテゴリ新規追加
router.post('/cate/insert', (req, res) => {
    const db = new sqlite3.Database(settings.DBPATH);
    const sql = `INSERT INTO cate (name) VALUES( ? );`;
    db.run(sql, [req.body.name], (err) => {
        if (err) {
            console.error(err.stack);
            res.status(500).send('<h1>/insert 500 Internal Server Error</h1>');
        }
    });
    db.close(() => {
        res.redirect('/cate');
    });
});

//カテゴリ更新
router.post('/cate/update', (req, res) => {
    const db = new sqlite3.Database(settings.DBPATH);
    const sql = `UPDATE cate SET name = ? WHERE id = ?;`;
    db.run(sql, [req.body.name, parseInt(req.body.id)], (err) => {
        if (err) {
            console.error(err.stack);
            res.status(500).send('<h1>/update 500 Internal Server Error</h1>');
        }
    });
    db.close(() => {
        res.redirect('/cate');
    });
});

//カテゴリ削除
router.post('/cate/delete', (req, res) => {
    const db = new sqlite3.Database(settings.DBPATH);
    const sql = `DELETE FROM cate WHERE id = ?;`;
    db.run(sql, [parseInt(req.body.id)], (err) => {
        if (err) {
            console.error(err.stack);
            res.status(500).send('<h1>/delete 500 Internal Server Error</h1>');
        }
    });
    db.close(() => {
        res.redirect('/cate');
    });
});


module.exports = router;