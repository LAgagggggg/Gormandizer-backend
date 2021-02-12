const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '19970720Cool',
  database : 'gormandizer'
});

connection.connect();

const app = new Koa();

const historyShownLimitNumber = 10;

// read history
let history;
function readHistory() {
    connection.query(`SELECT content FROM history ORDER BY create_time DESC LIMIT ${historyShownLimitNumber}`, function (error, results, fields) {
        history = results.map(function (object) {
            return object.content
        })
      });
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
        history.unshift(content);
	    if (history.length > historyShownLimitNumber) {
            history = history.slice(0, historyShownLimitNumber)
        }
    }
    else {
        history = [content];
    }
    connection.query(`INSERT INTO history (content, create_time) VALUES (\'${content}\', NOW())`)
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
