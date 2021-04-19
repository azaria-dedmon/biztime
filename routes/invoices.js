const express = require("express");
const router = new express.Router();
const db = require('../db');
const ExpressError = require("../expressError");

router.get('/', async(req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`)
        return res.json({invoices: [results.rows]})
    } catch(e) {
        return next(e)
    }
});

router.get('/:id', async(req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description, c.code
                                        FROM invoices AS i
                                        INNER JOIN companies AS c ON (i.comp_code=c.code)
                                        WHERE id=$1`, 
                                        [id])
        if(results.rows[0] === undefined) {
           throw new ExpressError
        }; 
        const data = {
            invoice: {
                id: results.rows[0].id,
                amt: results.rows[0].amt,
                paid: results.rows[0].paid,
                add_date: results.rows[0].add_date,
                paid_date: results.rows[0].paid_date,
                company: {
                    code: results.rows[0].code,
                    name: results.rows[0].name,
                    description: results.rows[0].description
                }
            }
        }
        return res.json(data)
    } catch(e) {
        return next()
    }
})

router.post('/', async(req, res, next) => {
    try {
        const {comp_code, amt} = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt)
                                        VALUES ($1, $2)
                                        RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
        [comp_code, amt])
        if(results.rows[0] === undefined) {
            throw new ExpressError
         }; 
        return res.json({invoices: results.rows})
    } catch(e) {
        next(e);
    }

})

router.put('/:id', async(req, res, next) => {
    try {
        const { amt, paid } = req.body;
        const { id } = req.params
        let paid_date;

        const checkPaidDate = await db.query (`
        SELECT paid
        FROM invoices
        WHERE id=$1
        `, [id])
        
        if(!checkPaidDate.rows[0].paid && paid) {
            paid_date = new Date()
        } else if (checkPaidDate.rows[0].paid && !paid) {
            paid_date = null
        } else {
            paid_date = checkPaidDate.rows[0].paid
        }

        const results = await db.query(`
        UPDATE invoices SET amt=$1, paid=$2
        WHERE id = $3
        RETURNING *
        `, [amt, paid, id])

        const data = {
            invoice: {
                id: results.rows[0].id,
                comp_code: results.rows[0].comp_code,
                amt: results.rows[0].amt,
                paid: results.rows[0].paid,
                add_date: results.rows[0].add_date,
                paid_date: paid_date
                }
            }
        if(results.rows[0] === undefined) throw new ExpressError
         return res.json(data)
    } catch(e) {
        next()
    }
})

router.delete('/:id', async(req, res, next) => {
    try {
        const results = await db.query('DELETE FROM invoices WHERE id = $1', [req.params.id])
        if (results.rows === undefined) throw new ExpressError
        return res.send({status: "deleted"})
    } catch(e) {
        next()
    }
})

module.exports = router