const db = require('./db/db.js');

module.exports = {
  products: {
    getProducts: (req, res) => {
      db.pool.query("SELECT * FROM product limit(4)", (err, data) => {
        res.status(200).send(data.rows);
        db.pool.end();
      });
    },
    getProductInfo: (req, res) => {},
    getProductStyles: (req, res) => {},
    getRelatedProducts: (req, res) => {},
  },
  reviews: {
    getReviews: (req, res) => {
      // product_id using req.params
      var queryStr = `SELECT * FROM reviews WHERE product_id = ${req.params.id}`;
      db.pool.query(queryStr, (err, data) => {
        res.status(200).send(data.rows);
        // db.pool.end();
      });
    },

    getMetadata: (req, res) => {
      var queryStr = `SELECT * FROM characteristic_reviews WHERE review_id = ${req.params.id}`;
      db.pool.query(queryStr, (err, data) => {
        res.status(200).send(data.rows);
      })
    },

    addNewReview: (req, res) => {

    },

    updateHelpfulCount: (req, res) => {

    },
  }
};
