const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/Database.js');
const userMiddleware = require('../middleware/UserModel.js');
var md5 = require('md5');
const fileUpload = require('express-fileupload');
const _ = require('lodash');
const mime = require('mime-types')
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
app.use(cors());

app.use(fileUpload({
    createParentPath: true
}));
app.get('/getAccounts', (req, res, next) => {
  db.query(`Select e.date
  ,e.expense_id 
  ,e.group
  ,e.sub_group 
  ,e.gst
  ,e.amount 
  ,e.gst_amount 
  ,e.service_charge 
  ,e.total_amount 
  ,e.description
  ,e.type
  ,e.invoice_code 
  ,e.invoice_date 
  ,e.payment_ref_no
  ,e.payment_status
  ,e.payment_date  
  ,e.job_id 
  ,e.remarks
  ,e.modified_by
  ,e.modification_date
  ,e.created_by
  ,e.creation_date
  ,eg.title AS group_name 
  ,esg.title AS sub_group_name 
  ,ig.title AS income_group_name 
  ,isg.title AS income_sub_group_name 
  FROM expense e LEFT JOIN expense_group eg
  ON e.group=eg.expense_group_id
  LEFT JOIN expense_sub_group esg
  ON e.sub_group=esg.expense_sub_group_id
  LEFT JOIN income_group ig
  ON e.group=ig.income_group_id
  LEFT JOIN income_sub_group isg
  ON e.sub_group=isg.income_sub_group_id
  WHERE expense_id !=''`,
    (err, result) => {
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });
      

        }
 
    }
  );
});

app.post('/getAccountsById', (req, res, next) => {
  db.query(`Select e.date 
  ,e.expense_id
  ,e.group
  ,e.sub_group 
  ,e.gst
  ,e.amount 
  ,e.gst_amount 
  ,e.service_charge 
  ,e.total_amount 
  ,e.description 
  ,e.type
  ,e.invoice_code 
  ,e.invoice_date 
  ,e.payment_ref_no
  ,e.payment_status 
  ,e.payment_date 
  ,e.job_id 
  ,e.remarks 
  ,e.modified_by
  ,e.modification_date
  ,e.created_by
  ,e.creation_date
  ,eg.title AS group_name 
  ,esg.title AS sub_group_name 
  ,ig.title AS income_group_name 
  ,isg.title AS income_sub_group_name 
  FROM expense e LEFT JOIN expense_group eg
  ON e.group=eg.expense_group_id
  LEFT JOIN expense_sub_group esg
  ON e.sub_group=esg.title
  LEFT JOIN income_group ig
  ON e.group=ig.income_group_id
  LEFT JOIN income_sub_group isg
  ON e.sub_group=isg.title
  WHERE expense_id = ${db.escape(req.body.expense_id)} ORDER BY e.expense_id DESC`,
    (err, result) => {
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });
      

        }
 
    }
  );
});

app.post('/checkInvoiceCodeUnique', (req, res) => {
    const { invoice_code } = req.body;
  
    // Execute an SQL query to check if the invoice_code already exists in the database
    const sqlQuery = 'SELECT COUNT(*) AS count FROM expense WHERE invoice_code = ?';
    db.query(sqlQuery, [invoice_code], (err, result) => {
      if (err) {
        // Handle database error
        console.error('Error executing SQL query:', err);
        return res.status(400).json({ error: 'Database error' });
      }
  
      // Extract the count from the result
      const count = result[0].count;
  
      // Respond with the count
      res.json({ count });
    });
  });



app.post('/editAccounts', (req, res, next) => {
  db.query(`UPDATE expense
            SET date=${db.escape(req.body.date)}
            ,amount=${db.escape(req.body.amount)}
            ,gst_amount=${db.escape(req.body.gst_amount)}
            ,gst=${db.escape(req.body.gst)}
            ,service_charge=${db.escape(req.body.service_charge)}
            ,description=${db.escape(req.body.description)}
            ,invoice_code=${db.escape(req.body.invoice_code)}
            ,invoice_date=${db.escape(req.body.invoice_date)}
            ,total_amount=${db.escape(req.body.total_amount)}
            ,payment_ref_no=${db.escape(req.body.payment_ref_no)}
            ,payment_status=${db.escape(req.body.payment_status)}
            ,payment_date=${db.escape(req.body.payment_date)}
            ,job_id=${db.escape(req.body.job_id)}
            ,remarks=${db.escape(req.body.remarks)}
            ,modified_by=${db.escape(req.body.modified_by)}
            ,modification_date=${db.escape(req.body.modification_date)}
            WHERE expense_id = ${db.escape(req.body.expense_id)}`,
    (err, result) => {
     
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });
      
      }
     }
  );
});
app.post('/insertexpense', (req, res, next) => {

  let data = {group	:req.body.group	
   , sub_group	: req.body.sub_group	
   , date: new Date(req.body.date).toISOString().slice(0, 19).replace("T", " ")
   ,amount: req.body.amount
   , gst_amount: req.body.gst_amount
   , service_charge	: req.body.service_charge
   , description	: req.body.description
   , created_by: req.body.created_by
   , creation_date: req.body.creation_date
   , modified_by: req.body.modified_by
   , modification_date		: req.body.modification_date		
   , site_id	: req.body.site_id	
   , quote_id	: req.body.quote_id	
   , source: req.body.source
   , gst: req.body.gst
   , gst_percentage: req.body.gst_percentage
   , invoice_date: req.body.invoice_date
   , invoice_code: req.body.invoice_code
   , payment_status	: 'Due'
   , received_date	: req.body.received_date
   , bank: req.body.bank
   , mode_of_payment: req.body.mode_of_payment
   , po_code: req.body.po_code
   , po_date: req.body.po_date
   , cheque_no		: req.body.cheque_no		
   , issued_date	: req.body.issued_date	
   , payment_cleared_date: req.body.payment_cleared_date
   , company_id: req.body.company_id
   , supplier_id: req.body.supplier_id
   , supplier_name: req.body.supplier_name
   , supplier_gst	: req.body.supplier_gst
   , customer_name	: req.body.customer_name
   , customer_gst: req.body.customer_gst
   , new_company: req.body.new_company
   , from_purchase_order: req.body.from_purchase_order
   , payment_ref_no: req.body.payment_ref_no
   , payment_date	: req.body.payment_date	
   , total_amount	: req.body.total_amount	
   , job_id: req.body.job_id
   , remarks: req.body.remarks
   , type: req.body.type
   
    
 };
  let sql = "INSERT INTO expense SET ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
      console.log('error: ', err)
      return res.status(400).send({
        data: err,
        msg: 'failed',
      })
    } else {
      return res.status(200).send({
        data: result,
        msg: 'Success',
          });
    }
  });
});

app.post('/deleteExpense', (req, res, next) => {

  let data = {expense_id: req.body.expense_id};
  let sql = "DELETE FROM expense WHERE ?";
  let query = db.query(sql, data,(err, result) => {
    if (err) {
      console.log('error: ', err)
      return res.status(400).send({
        data: err,
        msg: 'failed',
      })
    } else {
      return res.status(200).send({
        data: result,
        msg: 'Success',
          });
    }
  });
});


app.get('/getIncomeGroupTitle', (req, res, next) => {
  db.query(`SELECT 
  e.income_group_id
  ,e.title
   FROM income_group e
  `,
    (err, result) => {
       
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });
      
      

        }
 
    }
  );
});

app.post('/getIncomeSubGroupTitle', (req, res, next) => {
  db.query(`SELECT 
  e.income_group_id
  ,e.title AS income_sub_title
  ,income_sub_group_id
   FROM income_sub_group e
   where income_group_id =  ${db.escape(req.body.income_group_id)}
  `,
    (err, result) => {
       
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });
      
      

        }

  }
  );
});
app.get('/getGroupTitle', (req, res, next) => {
  db.query(`SELECT 
  e.expense_group_id
  ,e.title
   FROM expense_group e
  `,
    (err, result) => {
       
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });
      
      

        }
 
    }
  );
});

app.post('/getSubGroupTitle', (req, res, next) => {
  db.query(`SELECT 
  e.expense_group_id
  ,e.title
  ,expense_sub_group_id
   FROM expense_sub_group e
   where expense_group_id =  ${db.escape(req.body.expense_group_id)}
  `,
    (err, result) => {
       
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });
      
      

        }
 
    }
  );
});
app.post('/getGroupSubHeadLinkedById', (req, res, next) => {
  db.query(`select title
            ,expense_group_id
            ,expense_sub_group_id
            From expense_sub_group
            Where expense_group_id = ${db.escape(req.body.expense_group_id)}`,
    (err, result) => {
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });

        }
 
    }
  );
});

app.post('/checkInvoiceCode', (req, res, next) => {
  const { invoice_code } = req.body;

  // Execute an SQL query to check if the invoice_code already exists in the database
  const sqlQuery = `SELECT COUNT(*) AS count FROM expense e WHERE e.invoice_code = ?
  AND e.expense_id != ${db.escape(req.body.expense_id)}`;
  db.query(sqlQuery, [invoice_code], (err, result) => {
    if (err) {
      // Handle database error
      console.error('Error executing SQL query:', err);
      return res.status(400).json({ error: 'Database error' });
    }

    // Extract the count from the result
    const count = result[0].count;

    // Respond with the count
    res.json({ count });
  });
});

app.get('/getInvoiceAmount', (req, res, next) => {
  const { month, year, startDate, endDate } = req.query; // Extract query parameters

  let dateCondition = ''; // Initialize the date condition

  // Check if startDate and endDate are provided
  if (startDate && endDate) {
    dateCondition = `AND pm.invoice_date >= ${db.escape(startDate)} AND pm.invoice_date <= ${db.escape(endDate)}`;
  } else if (month && year) {
    dateCondition = `AND DATE_FORMAT(pm.invoice_date, '%m') = ${db.escape(month)} AND DATE_FORMAT(pm.invoice_date, '%Y') = ${db.escape(year)}`;
  }
  db.query(`SELECT 
  SUM(pm.invoice_amount) AS invoice_amount
  FROM invoice pm
  WHERE pm.invoice_id != ''
  AND pm.status != 'cancelled'
  ${dateCondition}
  `,
    (err, result) => {
       
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });
      
      

        }

  }
  );
})

app.get('/getNetPayroll', (req, res, next) => {
  const { month, year, startDate, endDate } = req.query; // Extract query parameters

  let dateCondition = ''; // Initialize the date condition

  // Check if startDate and endDate are provided
  if (startDate && endDate) {
    dateCondition = `AND pm.payslip_start_date >= ${db.escape(startDate)} AND pm.payslip_start_date <= ${db.escape(endDate)}`;
  } else if (month && year) {
    dateCondition = `AND pm.payroll_month = ${db.escape(month)} AND pm.payroll_year = ${db.escape(year)}`;
  }
  db.query(`SELECT 
  SUM(pm.net_total) AS net_total
  FROM payroll_management pm
  WHERE pm.payroll_management_id != ''
  ${dateCondition}
  `,
    (err, result) => {
       
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });
      
      

        }
 
    }
  );
});


app.get('/getGroupTitlzzze', (req, res, next) => {
  const { month, year, startDate, endDate } = req.query; // Extract query parameters

  let dateCondition = ''; // Initialize the date condition

  // Check if startDate and endDate are provided
  if (startDate && endDate) {
    dateCondition = `AND e.invoice_date >= ${db.escape(startDate)} AND e.invoice_date <= ${db.escape(endDate)}`;
  } else if (month && year) {
    dateCondition = `AND DATE_FORMAT(e.invoice_date, '%m') = ${db.escape(month)} AND DATE_FORMAT(e.invoice_date, '%Y') = ${db.escape(year)}`;
  }

  db.query(`
    SELECT 
      eg.expense_group_id,
      eg.title,
      (SELECT SUM(e.total_amount)
       FROM expense e
       WHERE e.group = eg.expense_group_id
       ${dateCondition}
       AND e.type = 'Expense') as credit_amount 
    FROM expense_group eg
    HAVING credit_amount > 0
  `,
    (err, result) => {
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        });
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
        });
      }
    }
  );
});


app.get('/getIncomeGroupAmount', (req, res, next) => {
  const { month, year, startDate, endDate } = req.query; // Extract query parameters

  let dateCondition = ''; // Initialize the date condition

  // Check if startDate and endDate are provided
  if (startDate && endDate) {
    dateCondition = `AND e.invoice_date >= ${db.escape(startDate)} AND e.invoice_date <= ${db.escape(endDate)}`;
  } else if (month && year) {
    dateCondition = `AND DATE_FORMAT(e.invoice_date, '%m') = ${db.escape(month)} AND DATE_FORMAT(e.invoice_date, '%Y') = ${db.escape(year)}`;
  }  db.query(`SELECT 
  eg.income_group_id
  ,eg.title
  ,(select sum(e.total_amount)
    FROM expense e
    WHERE e.group = eg.income_group_id
    ${dateCondition}
    AND e.type = 'Income' ORDER BY e.group ) as debit_amount 
   FROM income_group eg
   HAVING debit_amount > 0

  `,
    (err, result) => {
       
      if (err) {
        console.log('error: ', err)
        return res.status(400).send({
          data: err,
          msg: 'failed',
        })
      } else {
        return res.status(200).send({
          data: result,
          msg: 'Success',
            });
      
      

        }
    }
  );
});


app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;