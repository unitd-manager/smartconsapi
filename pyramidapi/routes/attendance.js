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

app.get("/getAttendance", (req, res, next) => {
  db.query(
    `SELECT s.attendance_id  
  ,s.staff_id
  ,s.leave_time
  ,s.creation_date
  ,s.modification_date 
  ,s.notes
  ,s.record_date
  ,s.on_leave
  ,s.time_in 
  ,s.over_time 
  ,s.due_time 
  ,s.description
  ,s.type_of_leave 
  ,s.created_by
  ,s.modified_by 
  ,s.task 
  ,s.latitude
  ,s.longitude 
  FROM attendance s
  LEFT JOIN staff b ON (b.staff_id = s.staff_id)
  WHERE s.attendance_id!=''`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success",
        });
      }
    }
  );
});

app.post("/getStaff", (req, res, next) => {
  db.query(
    `SELECT s.staff_id
    ,s.first_name
    ,a.time_in
    ,a.leave_time
    ,a.attendance_id
    ,a.notes
    ,a.in_progress_notes
    ,a.completed_notes
    ,a.creation_date
    ,s.published
    ,CONCAT_WS(' ', s.first_name, s.last_name ) AS staff_name
    FROM staff s 
    LEFT JOIN (attendance a) ON (a.staff_id = s.staff_id)
    AND a.creation_date=${db.escape(req.body.date)}
    WHERE s.staff_id !='' AND  (s.published = 1) ORDER BY s.staff_id ASC`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success",
        });
      }
    }
  );
});
app.post("/getYesterdayNotes", (req, res, next) => {
  db.query(
    `SELECT *
    FROM attendance
    WHERE attendance_id IN (SELECT MAX(attendance_id) FROM attendance GROUP BY staff_id)`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          data: err,
          status: "400",
        });
      } else {
          if(result.length > 0){
               return res.status(200).send({
          data: result,
          status: "200",
        });
          }else{
               return res.status(200).send({
              data: result,
             status: "400"
            });
          }
       
      }
    }
  );
});

app.post("/getAttendanceById", (req, res, next) => {
  db.query(
    `SELECT s.attendance_id  
    ,s.staff_id
    ,s.leave_time
    ,s.creation_date
    ,s.modification_date 
    ,s.notes
    ,s.record_date
    ,s.on_leave
    ,s.time_in 
    ,s.over_time 
    ,s.due_time 
    ,s.description
    ,s.type_of_leave 
    ,s.created_by
    ,s.modified_by 
    ,s.task 
    ,s.latitude
    ,s.longitude 
    FROM attendance s
    LEFT JOIN staff b ON (b.staff_id = s.staff_id)
    WHERE s.attendance_id =${db.escape(req.body.attendance_id)}`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success",
        });
      }
    }
  );
});

app.post("/editAttendance", (req, res, next) => {
  db.query(
    `UPDATE attendance
              SET staff_id=${db.escape(req.body.staff_id)}
              ,leave_time=${db.escape(req.body.leave_time)}
              ,creation_date=${db.escape(req.body.creation_date)}
              ,modification_date=${db.escape(req.body.modification_date)}
              ,notes=${db.escape(req.body.notes)}
              ,record_date=${db.escape(req.body.record_date)}
              ,on_leave=${db.escape(req.body.on_leave)}
              ,time_in=${db.escape(req.body.time_in)}
              ,over_time=${db.escape(req.body.over_time)}
              ,due_time=${db.escape(req.body.due_time)}
              ,description=${db.escape(req.body.description)}
              ,type_of_leave=${db.escape(req.body.type_of_leave)}
              ,created_by=${db.escape(req.body.created_by)}
              ,modified_by=${db.escape(req.body.modified_by)}
              ,task=${db.escape(req.body.description)}
              ,latitude=${db.escape(req.body.latitude)}
              ,longitude=${db.escape(req.body.longitude)}
              WHERE attendance_id = ${db.escape(req.body.attendance_id)}`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success",
        });
      }
    }
  );
});

app.post("/insertAttendance", (req, res, next) => {
    let sql = '';
    if(req.body.attendance_id){
       
   sql = `UPDATE attendance SET leave_time=${db.escape(req.body.record_date)},modified_by=${db.escape(req.body.modified_by)} WHERE attendance_id=${db.escape(req.body.attendance_id)}`;
   let query = db.query(sql,(err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "Cannot create attendance",
      });
    } else {
      return res.status(200).send({
        data: result,
        msg: "attendance created",
      });
    }
  });
    }else{
        let data = {
    staff_id: req.body.staff_id,
    modification_date: req.body.modification_date,
    record_date: req.body.record_date,
    time_in: req.body.record_date,
    modified_by: req.body.modified_by,
    created_by: req.body.created_by,
    creation_date:req.body.creation_date
  };
  sql = "INSERT INTO attendance SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "Cannot create attendance",
      });
    } else {
      return res.status(200).send({
        data: result,
        msg: "attendance created",
      });
    }
  });
    }
});

app.post("/editNotes", (req, res, next) => {
    var sql = `UPDATE attendance SET notes=${db.escape(req.body.notes)} WHERE attendance_id = ${db.escape(req.body.attendance_id)}`
      if(req.body.type == 'completed'){
          sql = `UPDATE attendance SET completed_notes=${db.escape(req.body.notes)} WHERE attendance_id = ${db.escape(req.body.attendance_id)}`
      }else if(req.body.type == 'inprogress'){
          sql = `UPDATE attendance SET in_progress_notes=${db.escape(req.body.notes)} WHERE attendance_id = ${db.escape(req.body.attendance_id)}`
      }
  db.query(
    sql,
    (err, result) => {
      if (err) {
         return res.status(400).send({
            data: err,
            msg: "Cannot create attendance",
          });
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success"
        });
      }
    }
  );
});


app.get('/getProjects', (req, res, next) => {
  db.query(`SELECT p.title
  ,p.project_id
  ,s.staff_id
  ,s.employee_id
  FROM project p LEFT JOIN (staff s) ON (p.staff_id = s.staff_id)
  WHERE p.project_id != ''
  ORDER BY p.title DESC`,
    (err, result) => {
       
      if (result.length == 0) {
        return res.status(400).send({
          msg: 'No result found'
        });
      } else {
            return res.status(200).send({
              data: result,
              msg:'Success'
            });
        }
    }
  );
});

app.post("/insertAppAttendance", (req, res, next) => {

    let data = {
    project_id : req.body.project_id,
    staff_id : req.body.staff_id,
    employee_id: req.body.employee_id,
    date: req.body.date,
    day_check_in_time: req.body.day_check_in_time,
    day_check_out_time: req.body.day_check_out_time,
    night_check_In_time: req.body.night_check_In_time,
    night_check_out_time:req.body.night_check_out_time,
    day_checkIn_latitude:req.body.day_checkIn_latitude,
    day_checkIn_longitude:req.body.day_checkIn_longitude,
    night_checkIn_latitude:req.body.night_checkIn_latitude,
    night_checkIn_longitude:req.body.night_checkIn_longitude,
  };
  sql = "INSERT INTO smart_attendance SET ?";
  let query = db.query(sql, data, (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "Cannot create attendance",
      });
    } else {
      return res.status(200).send({
        data: result,
        msg: "attendance created",
      });
    }
  });
});

app.post('/updateAppAttendance', (req, res, next) => {
  db.query(`UPDATE smart_attendance
            SET day_check_out_time=${db.escape(req.body.day_check_out_time)}
            ,night_check_out_time=${db.escape(req.body.night_check_out_time)}
            ,day_checkOut_latitude=${db.escape(req.body.day_checkOut_latitude)}
            ,day_checkOut_longitude=${db.escape(req.body.day_checkOut_longitude)}
            ,night_checkOut_latitude=${db.escape(req.body.night_checkOut_latitude)}
            ,night_checkOut_longitude=${db.escape(req.body.night_checkOut_longitude)}
            ,file=${db.escape(req.body.file)}
            WHERE id =  ${db.escape(req.body.id)}
            `,
    (err, result) =>{
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result.data,
              msg:'Success'
            });
      }
     }
  );
});

app.get("/getEmployeeData", (req, res, next) => {
  db.query(
    `SELECT sa.id  
  ,sa.staff_id
  ,sa.date
  ,sa.day_check_in_time
  ,sa.day_check_out_time
  ,sa.night_check_In_time
  ,sa.night_check_out_time
  ,p.title
  FROM smart_attendance sa
  LEFT JOIN project p ON (p.project_id = sa.project_id)
  WHERE sa.project_id!=''`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success",
        });
      }
    }
  );
});

app.post('/updateProfile', (req, res, next) => {
  db.query(`UPDATE staff
            SET file=${db.escape(req.body.file)}
            WHERE staff_id =  ${db.escape(req.body.staff_id)}
            `,
    (err, result) =>{
      if (err) {
        console.log("error: ", err);
        return;
      } else {
            return res.status(200).send({
              data: result.data,
              msg:'Success'
            });
      }
     }
  );
});

app.get("/getAllEmployeeData", (req, res, next) => {
  db.query(
    `SELECT sa.id  
  ,sa.staff_id
  ,sa.date
  ,sa.day_check_in_time
  ,sa.day_check_out_time
  ,sa.night_check_In_time
  ,sa.night_check_out_time
  ,p.title,
  s.first_name
  FROM smart_attendance sa
  LEFT JOIN project p ON (p.project_id = sa.project_id)
  LEFT JOIN staff s ON (s.staff_id = sa.staff_id)
  WHERE sa.project_id!=''`,
    (err, result) => {
      if (err) {
        console.log("error: ", err);
        return;
      } else {
        return res.status(200).send({
          data: result,
          msg: "Success",
        });
      }
    }
  );
});

app.post('/getAttendanceDataById', (req, res, next) => {
  db.query(`SELECT sa.id  
  ,sa.staff_id
  ,sa.date
  ,sa.day_check_in_time
  ,sa.day_check_out_time
  ,sa.night_check_In_time
  ,sa.night_check_out_time
  ,sa.day_checkIn_latitude
  ,sa.day_checkIn_longitude
  ,sa.day_checkOut_latitude
  ,sa.day_checkOut_longitude
  ,sa.night_checkIn_latitude
  ,sa.night_checkIn_longitude
  ,sa.night_checkOut_latitude
  ,sa.night_checkOut_longitude
  ,p.title,
  s.first_name
  FROM smart_attendance sa
  LEFT JOIN project p ON (p.project_id = sa.project_id)
  LEFT JOIN staff s ON (s.staff_id = sa.staff_id)
  WHERE sa.id=${db.escape(req.body.id)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          msg: 'No result found'
        });
      }else {
            return res.status(200).send({
              data: result[0],
              msg:'Success'
            });
        }
 
    }
  );
});


app.get("/secret-route", userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send("This is the secret content. Only logged in users can see that!");
});

module.exports = app;
