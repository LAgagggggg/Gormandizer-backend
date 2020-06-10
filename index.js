const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
var path = require("path");
var fs = require("fs");

const app = new Koa();

const historyLimitNumber = 10;

// read history
let history;
function readHistory() {
    fs.readFile('./history.txt', { encoding: "utf-8" }, function (err, file) {
        if (err) {
            console.log(err);
        } else {
            history = JSON.parse(file);
            if (Array.isArray(history) && history.length > historyLimitNumber) {
                history = history.slice(-historyLimitNumber)
            }
        }
    });
}

function writeHistory() {
    fs.writeFile('./history.txt', JSON.stringify(history), { flag: 'w', encoding: 'utf-8', mode: '0666' }, function (err) {
        if (err) {
            console.log(err);
        }
    })
}

app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    await next();
});

router.options('/commit', async (ctx, next) => {
    ctx.response.body = `200 OK`;
})

router.post('/commit', async (ctx, next) => {
    var content = ctx.request.body.content
    console.log(`committed: ${content}`);
    if (Array.isArray(history)) {
        history.push(content);
	if (Array.isArray(history) && history.length > historyLimitNumber) {
                history = history.slice(-historyLimitNumber)
        }
    }
    else {
        history = [content];
    }
    writeHistory();
    ctx.response.body = `200 OK`;
});

router.get('/history', async (ctx, next) => {
    ctx.response.body = JSON.stringify(history ?? "");
});

readHistory();
app.use(bodyParser());
app.use(router.routes());
app.listen(5556);
console.log('app started at port 5556...');
