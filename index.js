const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
var path = require("path");
var fs = require("fs");

const app = new Koa();

// read history
let history;
fs.readFile('./history.txt', { encoding: "utf-8" }, function (err, file) {
    if (err) {
        console.log(err);
    } else {
        history = JSON.parse(file);
    }
});

router.post('/commit', async (ctx, next) => {
    var content = ctx.request.body.content
    console.log(`committed: ${content}`);
    if (Array.isArray(history)) {
        history.push(content);
    }
    else {
        history = [content];
    }
    fs.writeFile('./history.txt', JSON.stringify(history), { flag: 'w', encoding: 'utf-8', mode: '0666' }, function (err) {
        if (err) {
            console.log("文件写入失败")
        }
    })
    ctx.response.body = `200 OK`;
});

router.get('/history', async (ctx, next) => {
    ctx.response.body = JSON.stringify(history);
});

app.use(bodyParser());
app.use(router.routes());
app.listen(3001);
console.log('app started at port 3001...');