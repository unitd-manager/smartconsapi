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




app.get('/getProjectTask', (req, res, next) => {
  db.query(`SELECT
  pt.project_task_id
  ,pt.project_id
  ,pt.company_id
  ,pt.employee_id
  ,pt.start_date
  ,pt.end_date
  ,pt.completion
  ,pt.task_title
  ,pt.status
  ,pt.media_id
  ,pt.description
  ,pt.job_order_id
  ,pt.estimated_hours
  ,pt.actual_hours
  ,pt.actual_completed_date
  ,pt.task_type
  ,pt.priority
  ,pt.creation_date
  ,pt.created_by
  ,pt.modification_date
  ,pt.modified_by
  ,p.title
  ,e.first_name
  ,e.employee_id
  ,jo.job_order_title
  ,jo.job_order_code
  FROM project_task pt
  LEFT JOIN project p ON p.project_id = pt.project_id
  LEFT JOIN employee e ON e.employee_id = pt.employee_id
  LEFT JOIN job_order jo ON jo.job_order_id = pt.job_order_id
  Where pt.project_task_id !=''`,
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
})
}
  }
);
});

app.post('/getProjectTaskById', (req, res, next) => {
    db.query(`SELECT
    pt.project_task_id
    ,pt.project_id
    ,pt.company_id
    ,pt.employee_id
    ,pt.start_date
    ,pt.end_date
    ,pt.completion
    ,pt.task_title
    ,pt.status
    ,pt.media_id
    ,pt.description
    ,pt.job_order_id
    ,pt.estimated_hours
    ,pt.actual_hours
    ,pt.actual_completed_date
    ,pt.task_type
    ,pt.priority
    ,pt.creation_date
    ,pt.created_by
    ,pt.modification_date
    ,pt.modified_by
    ,p.title
    ,e.first_name
    ,e.employee_id
    ,jo.job_order_title
    ,jo.job_order_code
    FROM project_task pt
    LEFT JOIN project p ON p.project_id = pt.project_id
    LEFT JOIN employee e ON e.employee_id = pt.employee_id
    LEFT JOIN job_order jo ON jo.job_order_id = pt.job_order_id
    Where pt.project_task_id=${db.escape(req.body.project_task_id)}`,
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
  })
  }
    }
  );
  });

app.get("/getProjectTitle", (req, res, next) => {
    db.query(
      `SELECT
    title,project_id
     From project `,
      (err, result) => {
        if (err) {
          console.log("error: ", err);
          return res.status(400).send({
            data: err,
            msg: "failed",
          });
        } else {
          return res.status(200).send({
            data: result,
            msg: "Success",
          });
        }
      }
    );
  });


  app.get("/getJobOrderTitle", (req, res, next) => {
    db.query(
      `SELECT
      job_order_title
      ,job_order_id
     From job_order `,
      (err, result) => {
        if (err) {
          console.log("error: ", err);
          return res.status(400).send({
            data: err,
            msg: "failed",
          });
        } else {
          return res.status(200).send({
            data: result,
            msg: "Success",
          });
        }
      }
    );
  });

  app.get("/getCompanyName", (req, res, next) => {
    db.query(
      `SELECT
      company_name
      ,company_id
     From company `,
      (err, result) => {
        if (err) {
          console.log("error: ", err);
          return res.status(400).send({
            data: err,
            msg: "failed",
          });
        } else {
          return res.status(200).send({
            data: result,
            msg: "Success",
          });
        }
      }
    );
  });


  app.post('/editProjectTask', (req, res, next) => {
    db.query(`UPDATE project_task 
              SET project_id=${db.escape(req.body.project_id)}
              ,employee_id=${db.escape(req.body.employee_id)}
              ,company_id=${db.escape(req.body.company_id)}
              ,start_date=${db.escape(req.body.start_date)}
              ,end_date=${db.escape(req.body.end_date)}
              ,completion=${db.escape(req.body.completion)}
              ,task_title=${db.escape(req.body.task_title)}
              ,status=${db.escape(req.body.status)}
              ,media_id=${db.escape(req.body.media_id)}
              ,description=${db.escape(req.body.description)}
              ,job_order_id=${db.escape(req.body.job_order_id)}
              ,estimated_hours=${db.escape(req.body.estimated_hours)}
              ,actual_completed_date=${db.escape(req.body.actual_completed_date)}
              ,actual_hours=${db.escape(req.body.actual_hours)}
              ,task_type=${db.escape(req.body.task_type)}
              ,priority=${db.escape(req.body.priority)}
              ,creation_date=${db.escape(req.body.creation_date)}
              ,created_by=${db.escape(req.body.created_by)}
              ,modification_date=${db.escape(req.body.modification_date)}
              ,modified_by=${db.escape(req.body.modified_by)}
              WHERE project_task_id = ${db.escape(req.body.project_task_id)}`,
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
            })
          }
              }
            );
          });


app.post('/insertProjectTask', (req, res, next) => {
  let data = {
    project_id	: req.body.project_id
    , employee_id	: req.body.employee_id
    , start_date: req.body.start_date
    , end_date: req.body.end_date
    , completion	: req.body.completion
    , task_title: req.body.task_title
    , status: req.body.status
    , media_id: req.body.media_id
    , description:req.body.description
    , job_order_id:req.body.job_order_id
    , estimated_hours:req.body.estimated_hours
    , actual_completed_date:req.body.actual_completed_date
    , task_type:req.body.task_type
    , priority:req.body.priority
    , created_by:req.body.created_by
    , creation_date:req.body.creation_date
    , modified_by:req.body.modified_by
    , modification_date:req.body.modification_date
 };
  let sql = "INSERT INTO project_task SET ?";
  let query = db.query(sql, data, (err, result) => {
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
})
}
  }
);
});

app.get('/getEmployeeName', (req, res, next) => {
    db.query(`SELECT 
    e.employee_id
   ,e.first_name
   ,e.nric_no
   ,e.fin_no
   ,(SELECT COUNT(*) FROM job_information ji WHERE ji.employee_id=e.employee_id AND ji.status='current') AS e_count
    FROM employee e 
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
  })
}
    }
  );
});



app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;