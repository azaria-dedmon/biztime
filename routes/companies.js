const express = require("express");
const slugify = require('slugify')
const router = new express.Router();
const db = require('../db');
const ExpressError = require("../expressError");

router.get('/', async(req, res, next) => {
    try {
        const results = await db.query(`SELECT * 
                                        FROM companies
                                        ORDER BY code`)
        return res.json({companies: [results.rows]})
    } catch(e) {
        return next(e)
    }
});

router.get('/:code', async(req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(`SELECT * 
                                        FROM ((companies AS c
                                        JOIN invoices AS i 
                                        ON (c.code=i.comp_code)
                                        JOIN companies_industries AS ci 
                                        ON (c.code=ci.company_code)
                                        JOIN industries AS ind
                                        ON ci.industry_code = ind.code
                                        ))
                                        WHERE c.code=$1`, [code])     
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
                },
                industries: {
                    name: results.rows[0].industry_name
                }
            }
        }
        return res.json(data)
    } catch (e) {
        next(e);
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
        let { code } = req.params
        code = slugify(code, {
            remove: /[*+~.()$%#^&><?=+}{|~'"!:@]/g, 
            lower: true, 
            replacement: ''
        })
        const { name, description } = req.body;
        const results = await db.query(`
        UPDATE companies SET name=$1, description=$2
        WHERE code = $3
        RETURNING code, name, description
        `, [name, description, code])
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
        const results = await db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
        if (results.rows === undefined) throw new ExpressError 
        return res.send({status: "deleted"})
    } catch(e) {
        next()
    }
})

module.exports = router