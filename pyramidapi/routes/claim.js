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

app.get('/getTabClaimPaymentPortal', (req, res, next) => {
  db.query(`SELECT cp.date,cp.claim_seq
            ,cp.claim_payment_id
            ,cp.amount
            ,cp.created_by
            ,cp.creation_date
            ,cp.status
            ,cp.claim_amount
            , SUM(amount) AS claim_amount,count(claim_payment_id) AS countRec 
            FROM claim_payment cp WHERE cp.project_id != ' ' AND cp.project_claim_id != '' 
            GROUP BY cp.claim_seq;`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });

          }
   
      }
    );
  });

  app.post('/getTabClaimPaymentPortalById11', (req, res, next) => {
    db.query(`SELECT 
    pc.claim_date
    ,pc.project_title
    ,ct.amount AS claimAmount
    ,cp.amount AS currentAmt
    ,cp.claim_payment_id
    ,ct.title
    ,ct.description
    ,(SELECT SUM(ccp.amount) AS amount 
    FROM claim_payment ccp
    WHERE ccp.claim_line_items_id = cp.claim_line_items_id
      AND ccp.claim_payment_id < cp.claim_payment_id
    ORDER BY ccp.claim_payment_id DESC
    LIMIT 1) AS prev_amount
    ,(    SELECT SUM(ccp.amount) AS totalAmount 
    FROM claim_payment ccp
    WHERE ccp.claim_line_items_id = cp.claim_line_items_id
      AND ccp.claim_payment_id <= cp.claim_payment_id
    ORDER BY ccp.claim_payment_id DESC
    LIMIT 1) AS cumAmount
    
              FROM claim_payment cp
              LEFT JOIN claim_line_items ct ON (ct.claim_line_items_id = cp.claim_line_items_id)
              LEFT JOIN project_claim pc ON (pc.project_claim_id = cp.project_claim_id)
               WHERE cp.claim_seq =${db.escape(req.body.claim_seq)}
                AND ct.project_id =${db.escape(req.body.project_id)} 
                AND ct.project_claim_id = ${db.escape(req.body.project_claim_id)}
              `,
      (err, result) => {
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
              });
  
            }
     
        }
      );
    });
    

    // app.post('/getTabClaimPaymentPortalById11', (req, res, next) => {
    //   db.query(`SELECT 
    //              cp.claim_seq
    //              ,cp.date
    //               ,cp.claim_payment_id
    //             ,cp.amount
    //             ,cp.created_by
    //             ,cp.creation_date
    //             ,cp.status
    //             ,cp.claim_amount
                
    //             FROM claim_payment cp WHERE cp.claim_payment_id =${db.escape(req.body.claim_payment_id)} AND  cp.project_id =${db.escape(req.body.project_id)} AND cp.project_claim_id = ${db.escape(req.body.project_claim_id)}
                
    //             ORDER BY cp.claim_payment_id `,
    //     (err, result) => {
    //       if (err) {
    //         console.log("error: ", err);
    //         return;
    //       } else {
    //             return res.status(200).send({
    //               data: result,
    //               msg:'Success'
    //             });
    
    //           }
       
    //       }
    //     );
    //   });

    app.post('/getTabClaimPaymentPortalById', (req, res, next) => {
      db.query(`SELECT 
                 cp.claim_seq
                 ,cp.date
                  ,cp.claim_payment_id
                  ,cp.claim_line_items_id
                ,cp.amount
                ,cp.created_by
                ,cp.creation_date
                ,cp.status
                , SUM(amount) AS claim_amount,count(claim_payment_id) AS countRec 
                FROM claim_payment cp
                 WHERE   cp.project_id =${db.escape(req.body.project_id)}
                  AND cp.project_claim_id = ${db.escape(req.body.project_claim_id)}
                GROUP BY cp.claim_seq
                ORDER BY cp.claim_payment_id
                 `,
        (err, result) => {
          if (err) {
            console.log("error: ", err);
            return;
          } else {
                return res.status(200).send({
                  data: result,
                  msg:'Success'
                });
    
              }
       
          }
        );
      });


      
    app.post('/getTabClaimPaymentPortalByIding', (req, res, next) => {
      db.query(`SELECT 
                 cp.claim_seq
                 ,cp.date
                  ,cp.claim_payment_id
                  ,cp.claim_line_items_id
                ,cp.amount
                ,cp.created_by
                ,cp.creation_date
                ,cp.status
                , SUM(amount) AS claim_amount,count(claim_payment_id) AS countRec 
                FROM claim_payment cp
                 WHERE   cp.project_id =${db.escape(req.body.project_id)}
                  AND cp.project_claim_id = ${db.escape(req.body.project_claim_id)}
                  AND cp.claim_seq !=  ${db.escape(req.body.claim_seq)}
                  AND cp.claim_payment_id < ${db.escape(req.body.claim_payment_id)}
                GROUP BY cp.claim_seq
                ORDER BY cp.claim_payment_id
                 `,
        (err, result) => {
          if (err) {
            console.log("error: ", err);
            return;
          } else {
                return res.status(200).send({
                  data: result,
                  msg:'Success'
                });
    
              }
       
          }
        );
      });

      app.get('/getClaimSeq', (req, res, next) => {
        db.query(` SELECT * 
        FROM claim_payment
        WHERE (claim_seq IS NOT NULL OR claim_seq != '')
        ORDER BY claim_payment_id DESC
        LIMIT 1
                   `,
          (err, result) => {
            if (err) {
              console.log("error: ", err);
              return;
            } else {
                  return res.status(200).send({
                    data: result,
                    msg:'Success'
                  });
      
                }
         
            }
          );
        });
    
  
  app.post('/insertClaimPaymenttable', (req, res, next) => {

    let data = {project_claim_id: req.body.project_claim_id,
                claim_line_items_id: req.body.claim_line_items_id,
                date: req.body.date,
                claim_seq: req.body.claim_seq,
                amount: req.body.amount,
                project_id: req.body.project_id,
                created_by: req.body.created_by,
                creation_date: req.body.creation_date,
                modified_by: req.body.modified_by,
                modification_date: req.body.modification_date,
                claim_amount: req.body.claim_amount,
                description: req.body.description,
                status: req.body.status,
                gst: req.body.gst,
                total_amount: req.body.total_amount,
              };
    let sql = "INSERT INTO claim_payment SET ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
      }
    });
  });


  app.post('/insertClaimLineItems11', (req, res, next) => {
    try {
      let data = {
        project_claim_id: req.body.project_claim_id,
        title: req.body.title,
        description: req.body.description,
        amount: req.body.amount,
        creation_date: req.body.creation_date,
        modification_date: req.body.modification_date,
        quantity: req.body.quantity,
        project_id: req.body.project_id,
        created_by: req.body.created_by,
        modified_by: req.body.modified_by,
        unit: req.body.unit,
        remarks: req.body.remarks,
        status: req.body.status,
      };
  
      let sql = "INSERT INTO claim_line_items SET ?";
      let query = db.query(sql, data, (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).send({
            error: "Internal Server Error",
            details: err.message // Add more details about the error
          });
        }
  
        return res.status(200).send({
          data: result,
          msg: 'Success'
        });
      });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).send({
        error: "Internal Server Error",
        details: error.message // Add more details about the error
      });
    }
  });
  

  // app.post('/insertClaimLineItems11', (req, res, next) => {
  
  //   let data = {
  //     project_claim_id: req.body.project_claim_id,
  //     title: req.body.title,
  //     description: req.body.description,
  //     amount: req.body.amount,
  //     creation_date: req.body.creation_date,
  //     modification_date: req.body.modification_date,
  //     quantity: req.body.quantity,
  //     project_id: req.body.project_id,
  //     created_by: req.body.created_by,
  //     modified_by: req.body.modified_by,
  //     unit: req.body.unit,
  //     remarks: req.body.remarks,
  //     status: req.body.status,
  //   };
  
  //   let sql = "INSERT INTO claim_line_items SET ?";
  //   let query = db.query(sql, data, (err, result) => {
  //     if (err) {
  //       console.log("error: ", err);
  //       return res.status(500).send({
  //         error: "Internal Server Error",
  //       });
  //     }
  
  //       return res.status(200).send({
  //         data: result,
  //         msg: 'Success'
  //       });
      
  //   });
  // });
  

  app.post('/insertClaimLineItems', (req, res, next) => {
    const poProductupdate = req.body.current_month_amount;
  
    let data = {
      project_claim_id: req.body.project_claim_id,
      title: req.body.title,
      description: req.body.description,
      amount: req.body.amount,
      amount_other: req.body.amount_other,
      item_type: req.body.item_type,
      sort_order: req.body.sort_order,
      creation_date: req.body.creation_date,
      modification_date: req.body.modification_date,
      quantity: req.body.quantity,
      project_id: req.body.project_id,
      created_by: req.body.created_by,
      modified_by: req.body.modified_by,
      unit: req.body.unit,
      remarks: req.body.remarks,
      status: 'In Progress',
    };
  
    let sql = "INSERT INTO claim_line_items SET ?";
    let query = db.query(sql, data, (err, result) => {
      if (err) {
        console.log("error: ", err);
        return res.status(500).send({
          error: "Internal Server Error",
        });
      }
  
      // Check if current_month_amount is greater than zero
      if (poProductupdate > 0) {
        // If yes, insert into claim_payment table
        let paymentData = {
          claim_line_items_id: result.insertId, // claim_line_items_id from the inserted result
          project_claim_id: req.body.project_claim_id, // project_claim_id from the request
          amount: poProductupdate,
          project_id: req.body.project_id,
          claim_seq: req.body.claim_seq,
          status: 'In Progress',
          // ... (other fields for claim_payment)
        };
  
        let paymentSql = "INSERT INTO claim_payment SET ?";
        db.query(paymentSql, paymentData, (paymentErr, paymentResult) => {
          if (paymentErr) {
            console.log("payment error: ", paymentErr);
            return res.status(500).send({
              error: "Internal Server Error",
            });
          }
  
          return res.status(200).send({
            data: result,
            paymentData: paymentResult,
            msg: 'Success'
          });
        });
      } else {
        // If current_month_amount is not greater than zero, only respond with the result
        return res.status(200).send({
          data: result,
          msg: 'Success'
        });
      }
    });
  });
  
  

  app.post('/insertProjectClaim', (req, res, next) => {

    let data = {claim_no: req.body.claim_no,
                project_id: req.body.project_id,
                client_id: req.body.client_id,
                project_title: req.body.project_title,
                description: req.body.description,
                po_quote_no: req.body.po_quote_no,
                ref_no: req.body.ref_no,
                claim_date: req.body.claim_date,
                status: req.body.status,
                amount: req.body.amount,
                created_by: req.body.created_by,
                creation_date: req.body.creation_date,
                modified_by: req.body.modified_by,
                modification_date: req.body.modification_date,
                variation_order_submission: req.body.variation_order_submission,
                value_of_contract_work_done: req.body.value_of_contract_work_done,
                vo_claim_work_done: req.body.vo_claim_work_done,
                claim_no: req.body.claim_no,
                less_previous_retention: req.body.less_previous_retention,
              };
    let sql = "INSERT INTO project_claim SET ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
      }
    });
  });

  app.delete('/deleteproject_claim', (req, res, next) => {

    let data = {project_claim_id : req.body.project_claim_id};
    let sql = "DELETE FROM project_claim WHERE ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
      }
    });
  });

  app.delete('/deleteclaim_line_items', (req, res, next) => {

    let data = {claim_line_items_id : req.body.claim_line_items_id };
    let sql = "DELETE FROM claim_line_items WHERE ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
      }
    });
  });

  app.delete('/deleteclaim_payment', (req, res, next) => {

    let data = {claim_payment_id : req.body.claim_payment_id };
    let sql = "DELETE FROM claim_payment WHERE ?";
    let query = db.query(sql, data,(err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
      }
    });
  });
  
  
  app.post('/TabClaimPortal', (req, res, next) => {
    db.query(`SELECT 
    pc.claim_date
    ,pc.claim_no
    ,pc.project_title
    ,pc.project_id
    ,pc.project_claim_id
    ,pc.ref_no
    ,pc.variation_order_submission
    ,pc.vo_claim_work_done
    ,pc.status
    ,pc.description
    ,pc.po_quote_no
    ,pc.value_of_contract_work_done
    ,pc.less_previous_retention
    ,pc.amount
    ,c.company_name
     FROM project_claim pc 
    LEFT JOIN (project p) ON (p.project_id = pc.project_id)
     LEFT JOIN (company c) ON (c.company_id = pc.client_id)
      WHERE pc.project_id =${db.escape(req.body.project_id)} `,
      (err, result) => {
         
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
              });
  
          }
   
      }
    );
  });    app.post("/getamountclaim", (req, res, next) => {
    // First query to get claim_payment data
    db.query(
      `SELECT pc.*, c.company_name
      FROM project_claim pc
      LEFT JOIN project p ON p.project_id = pc.project_id
      LEFT JOIN company c ON c.company_id = pc.client_id
      WHERE pc.project_id  = ${db.escape(req.body.project_id)}
         `,
      (err, result) => {
        if (err) {
          console.log("error: ", err);
          return res.status(400).send({
            data: err,
            msg: "failed",
          });
        }
  
        // Second query to get cumulative claim amount
        let promises = result.map((row) => {
          return new Promise((resolve, reject) => {
            db.query(
              ` SELECT SUM(amount) AS claimAmount
              FROM claim_line_items
              WHERE project_claim_id = ${db.escape(row.project_claim_id)}
               `,
              (err, cumulativeResult) => {
                if (err) {
                  reject(err);
                } else {
                  row.claimAmount = cumulativeResult[0] ? cumulativeResult[0].claimAmount : 0;
                  resolve(row);
                }
              }
            );
          });
        });
  
        // Wait for all promises to resolve
        Promise.all(promises)
          .then((combinedResult) => {
            return res.status(200).send({
              data: combinedResult,
              msg: "Success",
            });
          })
          .catch((error) => {
            console.log("error: ", error);
            return res.status(400).send({
              data: error,
              msg: "failed",
            });
          });
      }
    );
  });

  app.post('/editTabClaimPortal', (req, res, next) => {
    db.query(`UPDATE project_claim
              SET claim_date=${db.escape(req.body.claim_date)}
              ,project_title=${db.escape(req.body.project_title)}
              ,ref_no=${db.escape(req.body.ref_no)}
              ,variation_order_submission=${db.escape(req.body.variation_order_submission)}
              ,vo_claim_work_done=${db.escape(req.body.vo_claim_work_done)}
              ,description=${db.escape(req.body.description)}
              ,po_quote_no=${db.escape(req.body.po_quote_no)}
              ,value_of_contract_work_done=${db.escape(req.body.value_of_contract_work_done)}
              ,less_previous_retention=${db.escape(req.body.less_previous_retention)}
              ,amount=${db.escape(req.body.amount)}
                          WHERE project_claim_id = ${db.escape(req.body.project_claim_id)}`,
      (err, result) => {
       
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
              });
        }
       }
    );
  });
  
  app.post('/TabClaimPortalLineItem', (req, res, next) => {
    db.query(`SELECT 
    ct.*
   
    FROM claim_line_items ct 
     WHERE ct.project_claim_id = ${db.escape(req.body.project_claim_id)} 
     AND ct.status != 'Work Completed'
      ORDER BY ct.claim_line_items_id ASC`,
      (err, result) => {
         
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
              });
  
          }
   
      }
    );
  });

  app.post('/TabClaimPortalLineItemById', (req, res, next) => {
    db.query(`SELECT 
    ct.*
    ,(  SELECT SUM(amount) AS totalAmount 
    FROM claim_payment
    WHERE claim_line_items_id = ct.claim_line_items_id
    ORDER BY claim_payment_id DESC
    LIMIT 1) AS prev_amount
    FROM claim_line_items ct 
     WHERE ct.project_claim_id = ${db.escape(req.body.project_claim_id)} 
     AND ct.status != 'Work Completed'
      ORDER BY ct.claim_line_items_id ASC`,
      
    (err, result) => {
         
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
              });
  
          }
   
      }
    );
  });
  app.post('/TabClaimLineItemById', (req, res, next) => {
    db.query(`SELECT 
    ct.title
    ,ct.description
    ,ct.amount
    ,ct.project_claim_id
    ,ct.status FROM claim_line_items ct WHERE ct.claim_line_items_id = ${db.escape(req.body.claim_line_items_id)} ORDER BY ct.claim_line_items_id ASC`,
      (err, result) => {
         
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
              });
  
          }
   
      }
    );
  });
  app.post('/editTabClaimPortalLineItem', (req, res, next) => {
    db.query(`UPDATE claim_line_items
              SET title=${db.escape(req.body.title)}
              ,description=${db.escape(req.body.description)}
              ,status=${db.escape(req.body.status)}
              ,amount=${db.escape(req.body.amount)}
                          WHERE claim_line_items_id = ${db.escape(req.body.claim_line_items_id)}
                          `,
      (err, result) => {
       
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
              });
        }
       }
    );
  });

  app.post('/editTabClaimPortalPayment', (req, res, next) => {
    db.query(`UPDATE claim_payment
              SET amount=${db.escape(req.body.currentAmt)}
             WHERE claim_payment_id =${db.escape(req.body.claim_payment_id)} 
                  `,
      (err, result) => {
       
        if (err) {
          console.log("error: ", err);
          return;
        } else {
              return res.status(200).send({
                data: result,
                msg:'Success'
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