const request = require("supertest");

const app = require("../app");
const { createData } = require("./setup");
const db = require("../db");

beforeEach(createData);

afterAll(async () => {
  await db.end()
})

describe("GET /", function () {
    test("It should respond with array of invoices", async function () {
      const response = await request(app).get("/invoices");
      expect(response.body).toEqual({
        "invoices": [
          [
            {comp_code: "apple", "id": 1, amt: 100, paid: false, add_date: "2018-01-01T05:00:00.000Z", paid_date: null},
            {comp_code: "apple", "id": 2, amt: 200, paid: true, add_date: "2018-02-01T05:00:00.000Z", paid_date: "2018-02-02T05:00:00.000Z"},
            {comp_code: "ibm", "id": 3, amt: 300, paid: false, add_date: "2018-03-01T05:00:00.000Z", paid_date: null}
          ]
        ]
      });
    })
  });

  describe("GET /", function () {
    test("Should return a searched invoice", async function () {
      const response = await request(app).get("/invoices/1");
      expect(response.body).toEqual({
        "invoice": {
          "id": 1,
          "amt": 100,
          "paid": false,
          "add_date": "2018-01-01T05:00:00.000Z",
          "paid_date": null,
          "company": {
            "code": "apple",
            "name": "Apple",
            "description": "Maker of OSX."
          }
        }
      });
    })
  });

  describe("POST /", function () {
    test("Should post new invoice", async function () {
      const response = await request(app).post("/invoices")
      .send({comp_code: "apple", amt: 600})
      expect(response.body).toEqual({
        "invoices": [
          {
            id: 4, 
            comp_code: "apple",
            amt: 600,
            paid: false,
            add_date:  "2021-04-18T04:00:00.000Z",
            paid_date: null
          }
        ]
      });
    })
  });

  describe("PUT /", function () {
    test("Should update exisiting invoice", async function () {
      const response = await request(app).put("/invoices/1")
      .send({amt: 1000})
      expect(response.body).toEqual({
        "company": 
          {
            id: 1, 
            comp_code: "apple", 
            amt: 1000, 
            paid: false,
            add_date: "2018-01-01T05:00:00.000Z", 
            paid_date: null
          }
      })
    })
  });

  describe("DELETE /", function () {
    test("Should delete exisiting invoice", async function () {
      const response = await request(app).delete("/invoices/1")
      expect(response.body).toEqual({"status": "deleted"});
    })
  });