const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
var path = require("path");
var fs = require("fs");

const app = new Koa();

// read history
let history;
function readHistory() {
    fs.readFile('./history.txt', { encoding: "utf-8" }, function (err, file) {
        if (err) {
            console.log(err);
        } else {
            history = JSON.parse(file);
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
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    await next();
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
    writeHistory();
    ctx.response.body = `200 OK`;
});

router.get('/history', async (ctx, next) => {
    ctx.response.body = JSON.stringify(history);
});

readHistory();
app.use(bodyParser());
app.use(router.routes());
app.listen(3001);
console.log('app started at port 3001...');