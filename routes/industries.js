const express = require("express");
const router = new express.Router();
const db = require('../db');
const ExpressError = require("../expressError");


router.get('/', async(req, res, next) => {
    try {
        const results = await db.query(`SELECT * 
                                        FROM companies_industries`)
                                        
        return res.json({industries: [results.rows]})
    } catch(e) {
        return next(e)
    }
});

router.post('/', async(req, res, next) => {
    try {
        const { code, industry_name } = req.body;
        const results = await db.query(
            `INSERT INTO industries (code, industry_name ) VALUES ($1, $2) RETURNING code, industry_name`, 
            [code, industry_name])
        return res.json({industry: results.rows})
    } catch(e) {
        next(e);
    }

})

router.post('/:industry', async(req, res, next) => {
    try {
        const { industry } = req.params
        const { company_code } = req.body;
        const results = await db.query(
            `INSERT INTO companies_industries (company_code, industry_code ) VALUES ($1, $2) RETURNING company_code, industry_code`, 
            [company_code, industry])
        return res.json({industry: results.rows})
    } catch(e) {
        next(e);
    }

})


module.exports = router;