const request = require("supertest");

const app = require("../app");
const { createData } = require("./setup");
const db = require("../db");

beforeEach(createData);

afterAll(async () => {
  await db.end()
})

describe("GET /", function () {
  test("It should respond with array of companies", async function () {
    const response = await request(app).get("/companies");
    expect(response.body).toEqual({
      "companies": [
        [
        {code: "apple", name: "Apple", description: "Maker of OSX."},
        {code: "ibm", name: "IBM", description: "Big blue."},
        ]
      ]
    });
  })
});

describe("GET /", function () {
  test("Should return a searched company", async function () {
    const response = await request(app).get("/companies/apple");
    expect(response.body).toEqual({
      "company": {
        "code": "apple",
        "name": "Apple",
        "description": "Maker of OSX.",
        "invoices": {
          "id": 1,
          "amt": 100,
          "paid": false,
          "add_date": "2018-01-01T05:00:00.000Z",
          "paid_date": null
        }
      }
    });
  })
});

describe("POST /", function () {
  test("Should post new company", async function () {
    const response = await request(app).post("/companies")
    .send({code: "DIS", name: "Disney", description: "Maker of Disneyland"})
    expect(response.body).toEqual({
      "company": [
        {code: "DIS", name: "Disney", description: "Maker of Disneyland"}
      ]
    });
  })
});

describe("PUT /", function () {
  test("Should update exisiting company", async function () {
    const response = await request(app).put("/companies/apple")
    .send({code: "apple", name: "Apple", description: "We put apples on computers"})
    expect(response.body).toEqual({
      "company": 
        {code: "apple", name: "Apple", description: "We put apples on computers"}
    });
  })
});

describe("DELETE /", function () {
  test("Should delete exisiting company", async function () {
    const response = await request(app).delete("/companies/apple")
    expect(response.body).toEqual({"status": "deleted"});
  })
});