const express = require("express");
const router = new express.Router();
const db = require('../db');
const ExpressError = require("../expressError");

router.get('/', async(req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`)
        return res.json({companies: [results.rows]})
    } catch(e) {
        return next(e)
    }
});

router.get('/:code', async(req, res, next) => {
    try {
        const { code } = req.params;

        const results = await db.query(`SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description, c.code
                                        FROM companies AS c
                                        INNER JOIN invoices AS i ON (i.comp_code=c.code)
                                        WHERE code=$1`, [code])
        console.log(results)                                
        if (results.rows[0] === undefined) {
            throw new ExpressError
        }; 
        const data = {
            company: {
                code: results.rows[0].code,
                name: results.rows[0].name,
                description: results.rows[0].description,
                invoices: {
                    id: results.rows[0].id,
                    amt: results.rows[0].amt,
                    paid: results.rows[0].paid,
                    add_date: results.rows[0].add_date,
                    paid_date: results.rows[0].paid_date
                }
            }
        }
        return res.json(data)
    } catch (e) {
        next();
    };
});

router.post('/', async(req, res, next) => {
    try {
        const {code, name, description } = req.body;
        const results = await db.query(
            `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, 
            [code, name, description])
        return res.json({company: results.rows})
    } catch(e) {
        next(e);
    }

})

router.put('/:code', async(req, res, next) => {
    try {
        const { name, description } = req.body;
        const results = await db.query(`
        UPDATE companies SET name=$1, description=$2
        WHERE code = $3
        RETURNING code, name, description
        `, [name, description, req.params.code])
        if(results.rows[0] === undefined) {
            throw new ExpressError
         }; 
         return res.json({company: results.rows[0]})
    } catch(e) {
        next(e);
    }
})

router.delete('/:code', async(req, res, next) => {
    try {
        const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
        if (results.rows[0] === undefined) {
            throw new ExpressError
        }
        return res.send({status: "deleted"})
    } catch(e) {
        next()
    }
})

module.exports = router