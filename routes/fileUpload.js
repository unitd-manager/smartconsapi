const express = require('express');
const cors = require('cors');
const router = express.Router();
const upload = require('../helper/uploader');
const uploadController = require('../controller/upload.controller');
const maxFiles = 5;
router.use(cors());

router.get('/',uploadController.index);
router.post('/uploadFile',upload.single('file'),uploadController.uploadFile);
router.post('/getFileList',uploadController.getFileList);
router.get('/getFile/:name',uploadController.getFile);
router.delete('/getFile/:name',uploadController.removeFile);
router.post('/deleteFile',uploadController.removeFile);
router.post('/uploadFiles',upload.array('files', maxFiles), uploadController.uploadMultiple);
//router.post('/uploadProfile',upload.array('files', maxFiles), uploadController.uploadProfile);
router.post('/getListOfFiles',uploadController.getFilesByRecordIdAndRoomName);
router.post('/deleteFileByRoomNameAndId',uploadController.removeFilesByRoomRecord);


/* router.post('/upload-single',upload.single('file'),uploadController.uploadSingle);
router.post('/upload-multiple',upload.array('files', 5), uploadController.uploadMultiple);
router.post('/upload-single-v2',uploadController.uploadSingleV2); */

module.exports = router;