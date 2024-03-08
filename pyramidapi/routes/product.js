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

app.get('/getProducts', (req, res, next) => {
  db.query(`SELECT DISTINCT p.product_id
  ,p.category_id
  ,p.sub_category_id
  ,p.title
  ,p.description,
  p.qty_in_stock
  ,p.price
  ,p.published
  ,p.creation_date
  ,p.modification_date
  ,p.description_short
  ,p.general_quotation
  ,p.unit
  ,p.product_group_id
  ,p.item_code
  ,p.modified_by
  ,p.created_by
  ,p.part_number
  ,p.price_from_supplier
  ,p.latest
  ,p.section_id
  ,p.hsn_sac
  ,p.gst
  ,p.mrp
  ,p.tag_no
  ,p.product_type
  ,p.bar_code
  ,p.product_code
  ,p.discount_type
  ,p.discount_percentage
  ,p.discount_amount
  ,p.discount_from_date
  ,p.discount_to_date
  ,s.section_title
  ,c.category_title
  ,iv.actual_stock
  ,sc.sub_category_title,co.company_name,co.supplier_id,(SELECT GROUP_CONCAT(co.company_name ORDER BY co.company_name SEPARATOR ', ') 
  FROM supplier co, product_company pc 
  WHERE co.supplier_id = pc.company_id AND pc.product_id = p.product_id) AS company_records
  FROM product p LEFT JOIN (category c) ON (p.category_id = c.category_id) 
  LEFT JOIN inventory iv ON iv.product_id = p.product_id 
  LEFT JOIN (section s) ON (p.section_id = s.section_id) 
  LEFT JOIN (sub_category sc) ON (p.sub_category_id  = sc.sub_category_id)
  LEFT JOIN (product_company pc) ON (pc.product_id = p.product_id) 
  LEFT JOIN (supplier co) ON (co.supplier_id = pc.company_id)`,
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


app.get("/getProductsbySearchFilter", (req, res, next) => {
  const { keyword } = req.query; // Extract query parameters

  db.query(
    `SELECT p.product_id
  ,p.category_id
  ,p.sub_category_id
  ,p.title
  ,p.description,
  p.qty_in_stock
  ,p.price
  ,p.published
  ,p.creation_date
  ,p.modification_date
  ,p.description_short
  ,p.general_quotation
  ,p.unit
  ,p.product_group_id
  ,p.item_code
  ,p.modified_by
  ,p.created_by
  ,p.part_number
  ,p.price_from_supplier
  ,p.latest
  ,p.section_id
  ,p.hsn_sac
  ,p.gst
  ,p.mrp
  ,p.tag_no
  ,p.product_type
  ,p.bar_code
  ,p.product_code
  ,p.discount_type
  ,p.discount_percentage
  ,p.discount_amount
  ,p.discount_from_date
  ,p.discount_to_date
  ,s.section_title
  ,c.category_title
  ,sc.sub_category_title,co.company_name,co.supplier_id,(SELECT GROUP_CONCAT(co.company_name ORDER BY co.company_name SEPARATOR ', ') 
  FROM supplier co, product_company pc 
  WHERE co.supplier_id = pc.company_id AND pc.product_id = p.product_id) AS company_records
  FROM product p LEFT JOIN (category c) ON (p.category_id = c.category_id) 
  LEFT JOIN (section s) ON (p.section_id = s.section_id) 
  LEFT JOIN (sub_category sc) ON (p.sub_category_id  = sc.sub_category_id)
  LEFT JOIN (product_company pc) ON (pc.product_id = p.product_id) 
  LEFT JOIN (supplier co) ON (co.supplier_id = pc.company_id)
    where p.title LIKE CONCAT('%',  ${db.escape(keyword)}, '%') AND p.published=1 
     GROUP BY p.product_id`,
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

app.get('/getProductsPagination', (req, res, next) => {
  db.query(`SELECT DISTINCT p.product_id
  ,p.category_id
  ,p.sub_category_id
  ,p.title
  ,p.description,
  p.qty_in_stock
  ,p.price
  ,p.published
  ,p.creation_date
  ,p.modification_date
  ,p.description_short
  ,p.general_quotation
  ,p.unit
  ,p.product_group_id
  ,p.item_code
  ,p.modified_by
  ,p.created_by
  ,p.part_number
  ,p.price_from_supplier
  ,p.latest
  ,p.section_id
  ,p.hsn
  ,p.gst
  ,p.mrp
  ,p.tag_no
  ,p.product_type
  ,p.bar_code
  ,p.product_code
  ,p.discount_type
  ,p.discount_percentage
  ,p.discount_amount
  ,p.discount_from_date
  ,p.discount_to_date
  ,s.section_title
  ,c.category_title
  ,sc.sub_category_title,co.company_name,co.supplier_id,(SELECT GROUP_CONCAT(co.company_name ORDER BY co.company_name SEPARATOR ', ') 
  FROM supplier co, product_company pc 
  WHERE co.supplier_id = pc.company_id AND pc.product_id = p.product_id) AS company_records
  FROM product_pagination p LEFT JOIN (category c) ON (p.category_id = c.category_id) 
  LEFT JOIN (section s) ON (p.section_id = s.section_id) 
  LEFT JOIN (sub_category sc) ON (p.sub_category_id  = sc.sub_category_id)
  LEFT JOIN (product_company pc) ON (pc.product_id = p.product_id) 
  LEFT JOIN (supplier co) ON (co.supplier_id = pc.company_id)`,
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

app.post("/getProductsPagination", (req, res, next) => {

  var limit = req.body.length;
  var start = req.body.start;
  var where = "";
  var sqlTot = "";


  // check search value exist
  if (req.body.search.value) {
    var serVal = req.body.search.value;
    where += " WHERE ";
    where += "  p.title LIKE '%" + serVal + "%' ";
    where += " OR p.item_code LIKE '%" + serVal + "%' ";
    // where += " OR ur.user_status LIKE '%" + serVal + "%' ";
  }
  // getting total number records without any search
  var sql = `SELECT DISTINCT p.*
  ,c.category_title
  FROM product_pagination p LEFT JOIN (category c) ON (p.category_id = c.category_id)`;
  
  sqlTot = sql;

  //concatenate search sql if value exist
  if (where && where !== "") {
   
      sqlTot = `SELECT DISTINCT p.*
  ,c.category_title
  FROM product_pagination p LEFT JOIN (category c) ON (p.category_id = c.category_id) ${where}`;
   
    sql =  `SELECT DISTINCT p.*
  ,c.category_title
  FROM product_pagination p LEFT JOIN (category c) ON (p.category_id = c.category_id) ${where} LIMIT ${start} ,${limit}`;  
    
  }
    sql =  `SELECT DISTINCT p.*
  ,c.category_title
  FROM product_pagination p LEFT JOIN (category c) ON (p.category_id = c.category_id) LIMIT ${start} ,${limit}`;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "failed",
      });
    } else {
        let finalData = result
      db.query(sqlTot, (err, result) => {
        if (err) {
          return res.status(400).send({
            data: err,
            msg: "failed",
          });
        } else {
          return res.status(200).send({
            msg: "Success",
            draw: req.body.draw,
            recordsTotal: 20,
            recordsFiltered: result.length,
            data: finalData
          });
        }
      });
    }
  });
});

app.post("/getPaginationForProducts", (req, res, next) => {

  var limit = req.body.length;
  var start = req.body.start;
  var where = "";
  var sqlTot = "";


  // check search value exist
  if (req.body.search.value) {
    var serVal = req.body.search.value;
    where += " WHERE ";
    where += "  p.title LIKE '%" + serVal + "%' ";
    where += " OR p.item_code LIKE '%" + serVal + "%' ";
    // where += " OR ur.user_status LIKE '%" + serVal + "%' ";
  }
  // getting total number records without any search
  var sql = `SELECT DISTINCT p.*
  ,c.category_title
  FROM product p LEFT JOIN (category c) ON (p.category_id = c.category_id)`;
  
  sqlTot = sql;

  //concatenate search sql if value exist
  if (where && where !== "") {
   
      sqlTot = `SELECT DISTINCT p.*
  ,c.category_title
  FROM product p LEFT JOIN (category c) ON (p.category_id = c.category_id) ${where}`;
   
    sql =  `SELECT DISTINCT p.*
  ,c.category_title
  FROM product p LEFT JOIN (category c) ON (p.category_id = c.category_id) ${where} LIMIT ${start} ,${limit}`;  
    
  }
    sql =  `SELECT DISTINCT p.*
  ,c.category_title
  FROM product p LEFT JOIN (category c) ON (p.category_id = c.category_id) LIMIT ${start} ,${limit}`;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "failed",
      });
    } else {
        let finalData = result
      db.query(sqlTot, (err, result) => {
        if (err) {
          return res.status(400).send({
            data: err,
            msg: "failed",
          });
        } else {
          return res.status(200).send({
            msg: "Success",
            draw: req.body.draw,
            recordsTotal: 20,
            recordsFiltered: result.length,
            data: finalData
          });
        }
      });
    }
  });
});

app.post("/getPaginationForProductsSearch", (req, res, next) => {
  var limit = req.body.length || 10; // Default limit to 10 if not provided
  var start = req.body.start || 0; // Default start to 0 if not provided
  var where = "";
  var sqlTot = "";
  var params = []; // Define and initialize the params array

  // check search value exist
  if (req.body.search && req.body.search.value) {
    var serVal = req.body.search.value;
    where += " WHERE ";
    where += "  p.title LIKE ? OR p.item_code LIKE ? ";
    params.push('%' + serVal + '%', '%' + serVal + '%');
    // where += " OR ur.user_status LIKE ? "; // Add other search conditions if needed
    // params.push('%' + serVal + '%');
  }

  // getting total number records without any search
  var sql = `SELECT DISTINCT p.*, c.category_title
             FROM product p
             LEFT JOIN category c ON p.category_id = c.category_id`;

  sqlTot = sql;

  // concatenate search SQL if value exists
  if (where && where !== "") {
    sqlTot = `SELECT COUNT(*) AS total
              FROM product p
              LEFT JOIN category c ON p.category_id = c.category_id ${where}`;
    sql = `SELECT DISTINCT p.*, c.category_title
           FROM product p
           LEFT JOIN category c ON p.category_id = c.category_id
           ${where}
           LIMIT ?, ?`;

    params.push(parseInt(start), parseInt(limit));
  } else {
    sql += " LIMIT ?, ?";
    params.push(parseInt(start), parseInt(limit));
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "failed",
      });
    } else {
      let finalData = result;
      // If the search was performed, fetch the total count separately with the search condition
      if (where && where !== "") {
        db.query(sqlTot, params, (err, result) => {
          if (err) {
            return res.status(400).send({
              data: err,
              msg: "failed",
            });
          } else {
            return res.status(200).send({
              msg: "Success",
              draw: req.body.draw,
              recordsTotal: result.length > 0 ? result[0].total : 0,
              recordsFiltered: finalData.length,
              data: finalData,
            });
          }
        });
      } else {
        // If no search, use the same result for total count and filtered count
        return res.status(200).send({
          msg: "Success",
          draw: req.body.draw,
          recordsTotal: finalData.length,
          recordsFiltered: finalData.length,
          data: finalData,
        });
      }
    }
  });
});

app.post('/getProduct', (req, res, next) => {
  db.query(`SELECT p.product_id
  ,p.category_id
  ,p.sub_category_id
  ,p.title
  ,p.description
  ,p.qty_in_stock
  ,p.price
  ,p.published
  ,p.creation_date
  ,p.modification_date
  ,p.description_short
  ,p.general_quotation
  ,p.unit
  ,p.product_group_id
  ,p.item_code
  ,p.modified_by
  ,p.created_by
  ,p.part_number
  ,p.price_from_supplier
  ,p.latest
  ,p.section_id
  ,p.hsn
  ,p.gst
  ,p.mrp
  ,p.tag_no
  ,p.product_type
  ,p.bar_code
  ,p.product_code
  ,p.discount_type
  ,p.discount_percentage
  ,p.discount_amount
  ,p.discount_from_date
  ,p.discount_to_date
  FROM product p
  WHERE p.product_id = ${db.escape(req.body.product_id)} `,
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

app.post('/getProductPagination', (req, res, next) => {
  db.query(`SELECT p.product_id
  ,p.category_id
  ,p.sub_category_id
  ,p.title
  ,p.description
  ,p.qty_in_stock
  ,p.price
  ,p.published
  ,p.creation_date
  ,p.modification_date
  ,p.description_short
  ,p.general_quotation
  ,p.unit
  ,p.product_group_id
  ,p.item_code
  ,p.modified_by
  ,p.created_by
  ,p.part_number
  ,p.price_from_supplier
  ,p.latest
  ,p.section_id
  ,p.hsn
  ,p.gst
  ,p.mrp
  ,p.tag_no
  ,p.product_type
  ,p.bar_code
  ,p.product_code
  ,p.discount_type
  ,p.discount_percentage
  ,p.discount_amount
  ,p.discount_from_date
  ,p.discount_to_date
  FROM product_pagination p
  WHERE p.product_id = ${db.escape(req.body.product_id)} `,
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



app.post('/edit-Product', (req, res, next) => {
  db.query(`UPDATE product 
            SET title=${db.escape(req.body.title)}
            ,published=${db.escape(req.body.published)}
            ,category_id=${db.escape(req.body.category_id)}
            ,product_type=${db.escape(req.body.product_type)}
            ,price=${db.escape(req.body.price)}
            ,unit=${db.escape(req.body.unit)}
            ,description_short=${db.escape(req.body.description_short)}
            ,description=${db.escape(req.body.description)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.body.modified_by)}
            WHERE product_id =  ${db.escape(req.body.product_id)}`,
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


app.post('/edit-ProductPagination', (req, res, next) => {
  db.query(`UPDATE product_pagination
            SET title=${db.escape(req.body.title)}
            ,published=${db.escape(req.body.published)}
            ,category_id=${db.escape(req.body.category_id)}
            ,product_type=${db.escape(req.body.product_type)}
            ,price=${db.escape(req.body.price)}
            ,unit=${db.escape(req.body.unit)}
            ,description_short=${db.escape(req.body.description_short)}
            ,description=${db.escape(req.body.description)}
            ,modification_date=${db.escape(req.body.modification_date)}
            ,modified_by=${db.escape(req.user)}
            WHERE product_id =  ${db.escape(req.body.product_id)}`,
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


app.post('/insertProduct', (req, res, next) => {

  let data = {category_id: req.body.category_id
    ,  sub_category_id : req.body.sub_category_id 
    , title: req.body.title
    , product_code: req.body.product_code
    , description: req.body.description
    , qty_in_stock: req.body.qty
    , price: req.body.price
    , published:1
    , member_only: req.body.member_only
    , creation_date: req.body.creation_date
    , modification_date: null
    , chi_title: req.body.chi_title
    , chi_description: req.body.chi_description
    , sort_order: req.body.sort_order
    , meta_title: req.body.meta_title
    , meta_description: req.body.meta_description
    , meta_keyword: req.body.meta_keyword
    , latest : req.body. latest 
    , description_short: req.body.description_short
    , chi_description_short: req.body.chi_description_short
    , general_quotation: req.body.general_quotation
    , unit: req.body.unit
    , product_group_id: req.body.product_group_id
    , department_id: req.body.department_id
    , item_code: req.body.item_code
    , modified_by: req.body.modified_by
    , created_by: req.body.created_by
    , part_number: req.body.part_number
    , price_from_supplier: req.body.price_from_supplier
    , model: req.body.model
    , carton_no: req.body.carton_no
    , batch_no: req.body.batch_no
    , vat: req.body.vat
    , fc_price_code: req.body.fc_price_code
    , batch_import: req.body.batch_import
    , commodity_code: req.body.commodity_code
    , show_in_website: req.body.show_in_website
    , most_selling_product: req.body.most_selling_product
    , site_id: req.body.site_id
    , damaged_qty: req.body.damaged_qty
    , item_code_backup: req.body.item_code_backup
    , hsn_sac: req.body.hsn_sac
    , deals_of_week: req.body.deals_of_week
    , top_seller: req.body.top_seller
    , hot_deal: req.body.hot_deal
    , most_popular : req.body. most_popular 
    , top_rating: req.body.top_rating
    , section_id: req.body.section_id
    , discount_type: req.body.discount_type
    , discount_percentage: req.body.discount_percentage
    , discount_amount: req.body.discount_amount
    , hsn: req.body.hsn
    , gst: req.body.gst
    , product_weight: req.body.product_weight
    , tam_title: req.body.tam_title
    , tam_description: req.body.tam_description
    , tam_description_short: req.body.tam_description_short
    , supplier_id: req.body.supplier_id
    , product_type: req.body.product_type
    , bar_code: req.body.bar_code
    , tag_no: req.body.tag_no
    , pack_size : req.body. pack_size 
    , discount_from_date: req.body.discount_from_date
    , discount_to_date: req.body.discount_to_date
    , mrp: req.body.mrp};
  let sql = "INSERT INTO product SET ?";
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


app.post('/insertProductss', (req, res, next) => {

  let data = {category_id: req.body.category_id
    ,  sub_category_id : req.body.sub_category_id 
    , title: req.body.title
    , product_code: req.body.product_code
    , description: req.body.description
   ,product_type:req.body.product_type
   
    , published:1
    , member_only: req.body.member_only
    , creation_date: req.body.creation_date
    , modification_date: null
   };
  let sql = "INSERT INTO product SET ?";
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

app.post('/insertProductPagination', (req, res, next) => {

  let data = {category_id: req.body.category_id
    ,  sub_category_id : req.body.sub_category_id 
    , title: req.body.title
    , product_code: req.body.product_code
    , description: req.body.description
    , qty_in_stock: req.body.qty_in_stock
    , price: req.body.price
    , published:0
    , member_only: req.body.member_only
    , creation_date: req.body.creation_date
    , modification_date: req.body.modification_date
    , chi_title: req.body.chi_title
    , chi_description: req.body.chi_description
    , sort_order: req.body.sort_order
    , meta_title: req.body.meta_title
    , meta_description: req.body.meta_description
    , meta_keyword: req.body.meta_keyword
    , latest : req.body. latest 
    , description_short: req.body.description_short
    , chi_description_short: req.body.chi_description_short
    , general_quotation: req.body.general_quotation
    , unit: req.body.unit
    , product_group_id: req.body.product_group_id
    , department_id: req.body.department_id
    , item_code: req.body.item_code
    , modified_by: req.body.modified_by
    , created_by: req.user
    , part_number: req.body.part_number
    , price_from_supplier: req.body.price_from_supplier
    , model: req.body.model
    , carton_no: req.body.carton_no
    , batch_no: req.body.batch_no
    , vat: req.body.vat
    , fc_price_code: req.body.fc_price_code
    , batch_import: req.body.batch_import
    , commodity_code: req.body.commodity_code
    , show_in_website: req.body.show_in_website
    , most_selling_product: req.body.most_selling_product
    , site_id: req.body.site_id
    , damaged_qty: req.body.damaged_qty
    , item_code_backup: req.body.item_code_backup
    , hsn_sac: req.body.hsn_sac
    , deals_of_week: req.body.deals_of_week
    , top_seller: req.body.top_seller
    , hot_deal: req.body.hot_deal
    , most_popular : req.body. most_popular 
    , top_rating: req.body.top_rating
    , section_id: req.body.section_id
    , discount_type: req.body.discount_type
    , discount_percentage: req.body.discount_percentage
    , discount_amount: req.body.discount_amount
    , hsn: req.body.hsn
    , gst: req.body.gst
    , product_weight: req.body.product_weight
    , tam_title: req.body.tam_title
    , tam_description: req.body.tam_description
    , tam_description_short: req.body.tam_description_short
    , supplier_id: req.body.supplier_id
    , product_type: req.body.product_type
    , bar_code: req.body.bar_code
    , tag_no: req.body.tag_no
    , pack_size : req.body. pack_size 
    , discount_from_date: req.body.discount_from_date
    , discount_to_date: req.body.discount_to_date
    , mrp: req.body.mrp};
  let sql = "INSERT INTO product_pagination SET ?";
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



app.post('/deleteProduct', (req, res, next) => {

  let data = {product_id : req.body.product_id  };
  let sql = "DELETE FROM product WHERE ?";
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

app.post('/deleteProductPagination', (req, res, next) => {

  let data = {product_id : req.body.product_id  };
  let sql = "DELETE FROM product_pagination WHERE ?";
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


app.post('/insertProduct_Company', (req, res, next) => {

  let data = {
              product_id: req.body.product_id,
              company_id: req.body.company_id,
              creation_date: req.body.creation_date,
              modification_date: req.body.modification_date};
  let sql = "INSERT INTO product_company SET ?";
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

app.delete('/deleteProduct_Company', (req, res, next) => {

  let data = {product_company_id  : req.body.product_company_id   };
  let sql = "DELETE FROM product_company WHERE ?";
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

app.get('/getCategory', (req, res, next) => {
  db.query(`SELECT c.category_id
  ,c.category_title
  FROM category c
  WHERE c.category_id !='' `,
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

app.post('/insertCategory', (req, res, next) => {

  let data = {section_id: req.body.section_id
    , title: req.body.title
    , description: req.body.description
    , sort_order: req.body.sort_order
    ,  published : req.body. published 
    , creation_date: req.body.creation_date
    , modification_date: req.body.modification_date
    , chi_title : req.body. chi_title 
    , chi_description: req.body.chi_description
    , display_type: req.body.display_type
    , template: req.body.template
    , category_type: req.body.category_type
    , show_navigation_panel: req.body.show_navigation_panel
    ,  external_link : req.body. external_link 
    , meta_title: req.body.meta_title
    , meta_keyword: req.body.meta_keyword
    , meta_description : req.body. meta_description 
    , category_filter: req.body.category_filter
    , internal_link: req.body.internal_link
    , show_in_nav: req.body.show_in_nav};
  let sql = "INSERT INTO category SET ?";
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


app.delete('/deleteCategory', (req, res, next) => {

  let data = {category_id : req.body.category_id };
  let sql = "DELETE FROM category WHERE ?";
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

app.post('/insertSection', (req, res, next) => {

  let data = { title : req.body. title 
    , display_type: req.body.display_type
    , show_navigation_panel: req.body.show_navigation_panel
    , description: req.body.description
    ,  sort_order : req.body. sort_order 
    , published: req.body.published
    , creation_date: req.body.creation_date
    , modification_date : req.body. modification_date 
    , external_link: req.body.external_link
    , chi_title: req.body.chi_title
    , chi_description: req.body.chi_description
    , button_position: req.body.button_position
    , template: req.body.template
    ,  section_type : req.body. section_type 
    , meta_title: req.body.meta_title
    , meta_keyword: req.body.meta_keyword
    , meta_description : req.body. meta_description 
    , access_to: req.body.access_to
    , published_test: req.body.published_test
    , top_section_id: req.body.top_section_id
    , internal_link: req.body.internal_link
    , show_in_nav: req.body.show_in_nav
    , seo_title: req.body.seo_title};
  let sql = "INSERT INTO section SET ?";
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


app.delete('/deleteSection', (req, res, next) => {

  let data = {section_id  : req.body.section_id  };
  let sql = "DELETE FROM section WHERE ?";
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


app.post('/insertSubCategory', (req, res, next) => {

  let data = { category_id : req.body. category_id 
    , title: req.body.title
    , chi_title: req.body.chi_title
    , sort_order: req.body.sort_order
    ,  display_type : req.body. display_type 
    , published: req.body.published
    , show_navigation_panel: req.body.show_navigation_panel
    , external_link: req.body.external_link
    , sub_category_type: req.body.sub_category_type
    , template: req.body.template
    , creation_date: req.body.creation_date
    , modification_date: req.body.modification_date
    ,  published_test : req.body. published_test 
    , internal_link: req.body.internal_link
    , show_in_nav: req.body.show_in_nav};
  let sql = "INSERT INTO sub_category SET ?";
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

app.delete('/deleteSub_Category', (req, res, next) => {

  let data = { sub_category_id: req.body.sub_category_id };
  let sql = "DELETE FROM sub_category WHERE ?";
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

app.get('/getMaxItemCode', (req, res, next) => {
  db.query(`SELECT MAX (item_code) As itemc
  FROM product
  WHERE product_id !=''`,
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
app.post('/update-Publish', (req, res, next) => {
  db.query(`UPDATE product 
            SET published=${db.escape(req.body.published)}
            WHERE product_id =  ${db.escape(req.body.product_id)}`,
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
        
        app.post("/edit-ProductQty", (req, res, next) => {
  db.query(
    `UPDATE product 
            SET qty_in_stock=${db.escape(req.body.qty_in_stock)}
            ,modification_date=${db.escape(new Date())}
            ,modified_by=${db.escape(req.user)}
            WHERE product_id =  ${db.escape(req.body.product_id)}`,
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

app.post("/getPaginationFor", (req, res, next) => {
  var limit = req.body.length;
  var start = req.body.start;
  var where = "";
  var sqlTot = "";
  var sqlParams = [];

  // Check search value exists
  if (req.body.search && req.body.search.value) {
    var serVal = req.body.search.value.trim();
    where += " WHERE ";
    where += " p.title LIKE ? ";
    where += " OR p.item_code LIKE ? ";
    sqlParams.push(`%${serVal}%`, `%${serVal}%`);
  }

  // Getting total number of records without any search
  var sql = `SELECT DISTINCT p.*, c.category_title
             FROM product_pagination p
             LEFT JOIN category c ON p.category_id = c.category_id`;

  sqlTot = sql;

  // Concatenate search SQL if value exists
  if (where !== "") {
    sqlTot = `SELECT DISTINCT p.*, c.category_title
              FROM product_pagination p
              LEFT JOIN category c ON p.category_id = c.category_id ${where}`;

    sql = `SELECT DISTINCT p.*, c.category_title
           FROM product_pagination p
           LEFT JOIN category c ON p.category_id = c.category_id ${where}
           LIMIT ?, ?`;
    sqlParams.push(parseInt(start), parseInt(limit));
  }

  db.query(sql, sqlParams, (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "failed",
      });
    } else {
      let finalData = result;
      db.query(sqlTot, sqlParams, (err, result) => {
        if (err) {
          return res.status(400).send({
            data: err,
            msg: "failed",
          });
        } else {
          return res.status(200).send({
            msg: "Success",
            draw: req.body.draw,
            recordsTotal: 20, // Replace with the actual total records count
            recordsFiltered: result.length,
            data: finalData,
          });
        }
      });
    }
  });
});

app.post("/getProductsPaginationfiltr", (req, res, next) => {
  var limit = req.body.length;
  var start = req.body.start;
  var where = "";
  var sqlTot = "";
  var sqlParams = [];

  // check search value exist
  if (req.body.search.value) {
    var serVal = req.body.search.value;
    where += " WHERE ";
    where += " p.title LIKE ? ";
    where += " OR p.item_code LIKE ? ";
    sqlParams.push(`%${serVal}%`, `%${serVal}%`);
  }

  // getting total number records without any search
  var sql = `SELECT DISTINCT p.*, c.category_title
             FROM product_pagination p LEFT JOIN (category c) ON (p.category_id = c.category_id)`;

  sqlTot = sql;

  //concatenate search sql if value exist
  if (where && where !== "") {
    sqlTot = `SELECT DISTINCT p.*, c.category_title
              FROM product_pagination p LEFT JOIN (category c) ON (p.category_id = c.category_id) ${where}`;

    sql = `SELECT DISTINCT p.*, c.category_title
           FROM product_pagination p LEFT JOIN (category c) ON (p.category_id = c.category_id) ${where}
           LIMIT ?, ?`;
    sqlParams.push(parseInt(start), parseInt(limit));
  }

  db.query(sql, sqlParams, (err, result) => {
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "failed",
      });
    } else {
      let finalData = result;
      db.query(sqlTot, sqlParams, (err, result) => {
        if (err) {
          return res.status(400).send({
            data: err,
            msg: "failed",
          });
        } else {
          return res.status(200).send({
            msg: "Success",
            draw: req.body.draw,
            recordsTotal: 20, // Replace with the actual total records count
            recordsFiltered: result.length,
            data: finalData,
          });
        }
      });
    }
  });
});

app.post("/getCodeValue", (req, res, next) => {
  var type = req.body.type;
  let sql = '';
  let key_text = '';
  let withprefix = true;
  if(type == 'opportunity'){
      key_text = 'nextOpportunityCode';
      sql = "SELECT * FROM setting WHERE key_text='opportunityCodePrefix' OR key_text='nextOpportunityCode'";
  }else if(type == 'receipt'){
      key_text = 'nextReceiptCode';
      sql = "SELECT * FROM setting WHERE key_text='receiptCodePrefix' OR key_text='nextReceiptCode'";
  }else if(type == 'lead'){
      key_text = 'nextLeadsCode';
      sql = "SELECT * FROM setting WHERE key_text='leadsPrefix' OR key_text='nextLeadsCode'";  
  }else if(type == 'invoice'){
      key_text = 'nextInvoiceCode';
    sql = "SELECT * FROM setting WHERE key_text='invoiceCodePrefix' OR key_text='nextInvoiceCode'";  
  }else if(type == 'subConworkOrder'){
      key_text = 'nextSubconCode';
    sql = "SELECT * FROM setting WHERE key_text='subconCodePrefix' OR key_text='nextSubconCode'";  
  }
  else if(type == 'project'){
      key_text = 'nextProjectCode';
      sql = "SELECT * FROM setting WHERE key_text='projectCodePrefix' OR key_text='nextProjectCode'";  
  }else if(type == 'opportunityproject'){
      key_text = 'nextOpportunityProjectCode';
      sql = "SELECT * FROM setting WHERE key_text='opportunityprojectCodePrefix' OR key_text='nextOpportunityProjectCode'";  
  }else if(type == 'quote'){
      key_text = 'nextQuoteCode';
      sql = "SELECT * FROM setting WHERE key_text='quoteCodePrefix' OR key_text='nextQuoteCode'";  
  }
  else if(type == 'creditNote'){
      key_text = 'nextCreditNoteCode';
      sql = "SELECT * FROM setting WHERE key_text='creditNotePrefix' OR key_text='nextCreditNoteCode'";  
  }else if(type == 'employee'){
    //   withprefix = false;
      key_text = 'nextEmployeeCode';
    sql = "SELECT * FROM setting WHERE key_text='employeeCodePrefix' OR key_text='nextEmployeeCode'";  
  }
  else if(type == 'claim'){
      withprefix = false;
      key_text = 'nextClaimCode';
      sql = "SELECT * FROM setting WHERE  key_text='nextClaimCode'";  
  }
  else if(type == 'QuoteCodeOpp'){
      withprefix = false;
      key_text = 'nextQuoteCodeOpp';
      sql = "SELECT * FROM setting WHERE  key_text='nextQuoteCodeOpp'";  
  }
  else if(type == 'wocode'){
      key_text = 'nextWOCode';
      sql = "SELECT * FROM setting WHERE key_text='wOCodePrefix' OR key_text='nextWOCode'";  
  }
  else if(type == 'ProductCode'){
      key_text = 'nextProductCode';
      sql = "SELECT * FROM setting WHERE key_text='nextProductCodePrefix' OR key_text='nextProductCode'";  
  }
  else if(type == 'InventoryCode'){
      key_text = 'nextInventoryCode';
      sql = "SELECT * FROM setting WHERE key_text='inventoryCodePrefix' OR key_text='nextInventoryCode'";  
  }
  else if(type == 'ItemCode'){
      withprefix = false;
      key_text = 'nextItemCode';
      sql = "SELECT * FROM setting WHERE key_text='nextItemCode'"; 
  }
  let query = db.query(sql, (err, result) => {
      let old = result
    if (err) {
      return res.status(400).send({
        data: err,
        msg: "failed",
      });
    } else {
       
        var finalText = '';
        var newvalue = 0
        if(withprefix == true){
            var codeObject = result.filter(obj => obj.key_text === key_text);
            
             var prefixObject = result.filter(obj => obj.key_text != key_text);
            finalText = prefixObject[0].value + codeObject[0].value;
            newvalue = parseInt(codeObject[0].value) + 1
        }else{
            finalText = result[0].value
            newvalue = parseInt(result[0].value) + 1
        }
        newvalue = newvalue.toString()
         let query = db.query(`UPDATE setting SET value=${db.escape(newvalue)} WHERE key_text = ${db.escape(key_text)}`, (err, result) => {
            if (err) {
              return res.status(400).send({
                data: err,
                msg: "failed",
              });
            } else {
              return res.status(200).send({
                data: finalText,
                result:old
              });
            }
        });
    }
  });
});

app.get('/getUnitFromValueList', (req, res, next) => {
  db.query(
    `SELECT 
  value
  ,valuelist_id
  FROM valuelist WHERE key_text='UoM'`,
    (err, result) => {
      if (err) {
        console.log('error: ', err);
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

app.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});

module.exports = app;