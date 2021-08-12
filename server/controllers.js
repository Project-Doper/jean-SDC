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
      db.pool.query("SELECT * FROM reviews limit(4)", (err, data) => {
        res.status(200).send(data.rows);
        db.pool.end();
      });
    },

    getMetadata: (req, res) => {

    },

    addNewReview: (req, res) => {

    },

    updateHelpfulCount: (req, res) => {

    },
  }
};
