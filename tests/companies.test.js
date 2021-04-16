process.env.NODE_ENV === "test"
const request = require("supertest");

const app = require("../app");
const db = require('../db');
const [ code, name, description ] = ['flix', 'Netflix', 'A place to watch movies']

beforeEach(async () => {

    let results =  await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)`, 
    [code, name, description])
});

afterEach(async () => {
    let dataDelete = await db.query('DELETE FROM companies WHERE code = $1', [code])
})

describe("GET /companies", () => {
    test("Get all comapnies", async() => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({companies: [code, name, description]})
    })
})