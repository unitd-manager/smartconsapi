const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/Database.js");
const userMiddleware = require("../middleware/UserModel.js");
var md5 = require("md5");
const fileUpload = require("express-fileupload");
const _ = require("lodash");
const mime = require("mime-types");
var bodyParser = require("body-parser");
var cors = require("cors");
var app = express();
app.use(cors());

app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.get("/getTimesheet", (req, res, next) => {
  db.query(
    `SELECT * FROM employee_timesheet et INNER JOIN employee e ON e.employee_id = et.employee_id WHERE timesheet_id !=''`,
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

app.get("/getAllEmpTimesheet", (req, res, next) => {
  db.query(
    `SELECT * FROM employee_timesheet et 
    WHERE et.employee_timesheet_id !=''`,
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


app.post("/insertTimesheetEmployee", (req, res, next) => {
  let data = {
    project_id: req.body.project_id,
    employee_id: req.body.employee_id,
    creation_date: req.body.creation_date,
    month: req.body.month,
    year: req.body.year,
    day: req.body.day,
  };
  let sql = "INSERT INTO employee_timesheet SET ?";
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

  });
});

app.post("/getTimesheetStaffById", (req, res, next) => {
  db.query(
    `SELECT * FROM employee_timesheet et 
    INNER JOIN employee e ON e.employee_id = et.employee_id 
    INNER JOIN project p ON p.project_id = et.project_id
    WHERE et.project_id = ${db.escape(req.body.project_id)}`,
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


app.post("/insertTimesheetRate", (req, res, next) => {
  let data = {
      project_id: req.body.project_id,
      employee_id: req.body.employee_id,
      creation_date: req.body.creation_date,
      month: req.body.month,
      year: req.body.year,
      day: req.body.day,
      normal_hourly_rate: req.body.normal_hourly_rate,
      ot_hourly_rate: req.body.ot_hourly_rate,
      ph_hourly_rate: req.body.ph_hourly_rate,
      
  };
  let sql = "INSERT INTO employee_timesheet SET ?";
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

  });
});

app.post('/updateTimesheet', (req, res, next) => {
  db.query(`UPDATE employee_timesheet 
            SET normal_hourly_rate=${db.escape(req.body.normal_hourly_rate)}
            ,ot_hourly_rate=${db.escape(req.body.ot_hourly_rate)}
            ,ph_hourly_rate=${db.escape(req.body.ph_hourly_rate)}
            WHERE employee_id =  ${db.escape(req.body.employee_id)} AND project_id =  ${db.escape(req.body.project_id)}
            AND month =  ${db.escape(req.body.month)} AND year =  ${db.escape(req.body.year)}`,
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


app.post("/insertTimesheetMonth", (req, res, next) => {
  let data = {
      project_id: req.body.project_id,
      employee_id: req.body.employee_id,
      creation_date: req.body.creation_date,
      month: req.body.month,
      year: req.body.year,
      day: req.body.day,
      normal_hours: req.body.normal_hours,
      ot_hours: req.body.ot_hours,
      ph_hours: req.body.ph_hours,
      normal_hourly_rate: req.body.normal_hourly_rate,
      ot_hourly_rate: req.body.ot_hourly_rate,
      ph_hourly_rate: req.body.ph_hourly_rate
  };
  let sql = "INSERT INTO employee_timesheet SET ?";
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

  });
});

app.post('/updateTimesheetMonth', (req, res, next) => {
  db.query(`UPDATE employee_timesheet 
            SET normal_hours=${db.escape(req.body.normal_hours)}
            ,ot_hours=${db.escape(req.body.ot_hours)}
            ,ph_hours=${db.escape(req.body.ph_hours)}
            ,modification_date= ${db.escape(req.body.modification_date)}
             WHERE employee_timesheet_id  =  ${db.escape(req.body.employee_timesheet_id )} AND employee_id =  ${db.escape(req.body.employee_id)} AND project_id =  ${db.escape(req.body.project_id)}`,
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

app.post('/getTotalSalary', (req, res, next) => {
  db.query(`
   SELECT
  employee_id,
  project_id,
  month,year,
  SUM(normal_hours) AS total_normal_hours,
  SUM(ot_hours) AS total_ot_hours,
  SUM(ph_hours) AS total_ph_hours,
  SUM(normal_hours * COALESCE(normal_hourly_rate, 0)) AS total_normal_cost,
  SUM(ot_hours * COALESCE(ot_hourly_rate, 0)) AS total_ot_cost,
  SUM(ph_hours * COALESCE(ph_hourly_rate, 0)) AS total_ph_cost,
  (SUM(normal_hours * COALESCE(normal_hourly_rate, 0)) +
   SUM(ot_hours * COALESCE(ot_hourly_rate, 0)) +
   SUM(ph_hours * COALESCE(ph_hourly_rate, 0))) AS total_cost 
FROM employee_timesheet
WHERE month = ${db.escape(req.body.month)} AND year = ${db.escape(req.body.year)}
GROUP BY employee_id, project_id
  `,
  (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: 'failed',
      });
    } else {
      return res.status(200).send({
        data: result,
        msg: 'Success'
      });
    }
  });
});

  
app.post('/getGroupData', (req, res, next) => {
  db.query(`SELECT *
FROM employee_timesheet
WHERE project_id=${db.escape(req.body.project_id)} 
AND employee_id=${db.escape(req.body.employee_id)} AND month=${db.escape(req.body.month)} AND year=${db.escape(req.body.year)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
          msg: 'failed'
        })
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });

          }
   
      }
    );
  });
module.exports = app;