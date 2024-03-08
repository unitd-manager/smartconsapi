// const sgMail = require('@sendgrid/mail');
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

app.post('/sendemail', (req, res, next) => {
    
sgMail.setApiKey("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")

  let data = {
      to: req.body.to, 
      from: 'sulfiya@unitdtechnologies.com',
      subject: req.body.subject,
      //text:  req.body.text,
      html: req.body.text
 };
 sgMail
  .send(data)
  .then((response) => {
     return res.status(200).send({
        data: response,
        msg: 'Success',
      })
  })
  .catch((error) => {
       return res.status(400).send({
        data: error,
        msg: 'failed',
      })
  })
 
});



app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;