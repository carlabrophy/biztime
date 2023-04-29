process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
beforeEach(async () => {
	await db.query("DELETE FROM companies");
	const res = await db.query(
		"INSERT INTO companies (code, name, description) VALUES ('samsung', 'Samsung', 'Samsung smart TV.') RETURNING code, name, description"
	);
	testCompany = res.rows;
});

afterAll(async () => {
	await db.end();
});

describe("GET /", function () {
	test("It should respond with array of companies", async () => {
		const res = await request(app).get("/companies");

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			companies: testCompany,
		});
	});
});

describe("GET /companies/:code", () => {
	test("It should return a json company with the code provided", async () => {
		const res = await request(app).get(`/companies/${testCompany[0].code}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ company: testCompany[0] });
	});

	test("Should respond with 404", async () => {
		const res = await request(app).get("/companies/chewy");

		expect(res.statusCode).toBe(404);
		expect(res.body).toEqual({
			error: {
				message: "Can't find code of chewy",
				status: 404,
			},
		});
	});
});

describe("POST /companies", () => {
	test("Creating a new company", async () => {
		const res = await request(app)
			.post("/companies")
			.send({ name: "Lg", description: "Washing machine." });

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			company: {
				code: "lg",
				name: "Lg",
				description: "Washing machine.",
			},
		});
	});
});

describe("PUT /companies/:id", () => {
	test("Should return an updated company", async () => {
		const res = await request(app)
			.put(`/companies/${testCompany[0].code}`)
			.send({ name: "Samsung", description: "Samsung Laptop." });

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			company: {
				code: "samsung",
				name: "Samsung",
				description: "Samsung Laptop.",
			},
		});
	});

	test("Should response wiht 404 if code is not found", async () => {
		const res = await request(app)
			.put(`/companies/iphone`)
			.send({ name: "Samsung", description: "Samsung Laptop." });

		expect(res.statusCode).toBe(404);
		expect(res.body).toEqual({
			error: {
				message: "Can't find/update the id of iphone",
				status: 404,
			},
		});
	});
});

describe("DELETE /companies/:code", () => {
	test("Should responde with a message deleted", async () => {
		const res = await request(app).delete(`/companies/${testCompany[0].code}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ status: "deleted" });
	});
});
