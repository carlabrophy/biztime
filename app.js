/** BizTime express application. */

const express = require("express");
const companiesRoute = require("./routes/companies.js");
const invoicesRoute = require("./routes/invoices.js");
const app = express();
const ExpressError = require("./expressError");
const morgan = require("morgan");

app.use(express.json());
app.use(morgan("dev"));

//companies route
app.use("/companies", companiesRoute);
app.use("/invoices", invoicesRoute);

/** 404 handler */

app.use(function (req, res, next) {
	const err = new ExpressError("Not Found", 404);
	return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
	let status = err.status || 500;

	return res.status(status).json({
		error: {
			message: err.message,
			status: status,
		},
	});
});

module.exports = app;
