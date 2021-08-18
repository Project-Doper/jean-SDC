const db = require("./db/db.js");
const moment = require("moment");

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

      // TO_CHAR(TO_TIMESTAMP(date / 1000), 'YYYY-MM-DDThh:mm:ss.SSSZ') AS date

      var queryStr = `SELECT id, product_id, rating, TO_CHAR(TO_TIMESTAMP(date / 1000), 'YYYY-MM-DDThh:mm:ss.SSSZ') AS date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness FROM reviews WHERE product_id = ${req.params.id}`;

      db.pool.query(queryStr, (err, data) => {
        res.status(200).send(data.rows);
      });
    },

    getMetadata: (req, res) => {
      var queryStr = `SELECT * FROM characteristic_reviews WHERE review_id = ${req.params.id}`;
      db.pool.query(queryStr, (err, data) => {
        res.status(200).send(data.rows);
      });
    },

    addNewReview: (req, res) => {
      // need a transaction
      // need parameterized queries in the transaction
      // don't have to worry about SQL injection
      // keep track of response time

      db.client.connect();
      db.client
        .query("BEGIN")
        .then(() => {
          var date = moment().valueOf();

          var reviewQueryStr = `INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING (id)`;

          var reviewValues = [
            req.body.product_id,
            req.body.rating,
            date,
            req.body.summary,
            req.body.body,
            req.body.recommend,
            false,
            req.body.reviewer_name,
            req.body.reviewer_email,
            null,
            0,
          ];

          return db.client.query(reviewQueryStr, reviewValues);
        })
        .then((data) => {
          // console.log("data.rows[0].id: ", data.rows[0].id);

          var characteristicKeys = Object.keys(req.body.characteristics);

          var characteristicValues = Object.values(req.body.characteristics);

          for (var i = 0; i < characteristicKeys.length; i++) {
            var innerCharQueryStr = `INSERT INTO characteristic_reviews (characteristic_id, review_id, value) VALUES ($1, $2, $3)`;

            var innerCharArray = [
              parseInt(characteristicKeys[i]),
              // use dot notation to access review_id
              data.rows[0].id,
              characteristicValues[i],
            ];

            db.client.query(innerCharQueryStr, innerCharArray);
          }

          for (var i = 0; i < req.body.photos.length; i++) {
            var revPhotosQueryStr = `INSERT INTO reviews_photos (review_id, url) VALUES ($1, $2)`;
            var photoValues = [data, req.body.photos[i]];

            db.client.query(revPhotosQueryStr, photoValues);
          }
        })
        .then(() => {
          db.client.query("COMMIT");
        })
        .then(() => {
          console.log("Transaction completed!");
          res.status(201).send();
        })
        .catch((err) => {
          console.error("Error received during query: ", err);
          return db.client.query("ROLLBACK");
        })
        .catch((err) => {
          console.log("Error received while rolling back transaction: ", err);
        });
    },

    updateHelpfulCount: (req, res) => {
      console.log("req.params: ", req.params);

      var updateQueryStr = `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = ${req.params.review_id}`;

      db.pool.query(updateQueryStr, (err, data) => {
        if (err) {
          console.log(err);
          return;
        } else {
          res.status(200).send(data.rows);
        }
      });
    },
  },
};

/*

  [ 
    {
      id: 1, 
      characteristic_id: 1, 
      review_id: 1, 
      value: 4
    },
    {
      id: 2, 
      characteristic_id: 2, 
      review_id: 1, 
      value: 3
    }
  ]

*/
