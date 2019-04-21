//カテゴリ更新関数
function updateCate(e) {
    const data_id = e.target.getAttribute('data-id');
    const name = document.getElementById('id_' + data_id).value;
    //form作成してsubmit
    const form = document.createElement('form');
    form.action = '/post/cate/update';
    form.method = 'post';
    const i1 = document.createElement('input');
    i1.name = 'id';
    i1.value = data_id;
    form.appendChild(i1);
    const i2 = document.createElement('input');
    i2.name = 'name';
    i2.value = name;
    form.appendChild(i2);
    document.body.appendChild(form);
    form.submit();
}

//カテゴリ削除関数
function deleteCate(e) {
    let result = window.confirm("削除しますか？");
    if (!result) {
        return;
    }
    const data_id = e.target.getAttribute('data-id');
    //form作成してsubmit
    const form = document.createElement('form');
    form.action = '/post/cate/delete';
    form.method = 'post';
    const i1 = document.createElement('input');
    i1.name = 'id';
    i1.value = data_id;
    form.appendChild(i1);
    document.body.appendChild(form);
    form.submit();

}
//カテゴリイベント登録
const updateBtns = document.querySelectorAll('.btn.btn-primary');
if (updateBtns.length > 0) {
    for (let v of updateBtns) {
        v.addEventListener('click', updateCate);
    }
}
const deleteBtns = document.querySelectorAll('.btn.btn-danger.cate');
if (deleteBtns.length > 0) {
    for (let v of deleteBtns) {
        v.addEventListener('click', deleteCate);
    }
}