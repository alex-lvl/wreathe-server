"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const users_js_1 = __importDefault(require("./routes/users.js"));
const login_js_1 = __importDefault(require("./routes/login.js"));
// import logoutRouter from './routes/logout.js'
const threads_js_1 = __importDefault(require("./routes/threads.js"));
const register_js_1 = __importDefault(require("./routes/register.js"));
const refresh_token_js_1 = __importDefault(require("./routes/refresh-token.js"));
const app = (0, express_1.default)();
if (process.env.NODE_ENV !== 'production') {
    app.use((0, cors_1.default)({
        origin: 'http://localhost:3000',
        credentials: true,
    }));
}
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/', index_js_1.default);
app.use('/users', users_js_1.default);
app.use('/login', login_js_1.default);
// app.use('/logout', logoutRouter)
app.use('/register', register_js_1.default);
app.use('/threads', threads_js_1.default);
app.use('/refresh-token', refresh_token_js_1.default);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next((0, http_errors_1.default)(404));
});
// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
module.exports = app;
