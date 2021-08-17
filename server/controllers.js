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
        // console.log('data: ', data);
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

      console.log('req.body: ', req.body);

      // need a transaction
      // need parameterized queries in the transaction
        // don't have to worry about SQL injection
      // keep track of response time

      // var charReviewQueryStr = `INSERT INTO characteristic_reviews (characteristic_id, review_id, value) VALUES ($1, $2, $3)`;
      
      // var joinQueryStr = `SELECT * FROM reviews INNER JOIN characteristic_reviews ON reviews.id = characteristic_reviews.review_id LIMIT(10)
      // `;

      // reviews & characteristics
      // reviews_photos & characteristic_reviews
      db.client.connect()
      db.client
        .query("BEGIN")
        .then(() => {

          var reviewQueryStr = `INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING (id)`;

          var reviewValues = [req.body.product_id, req.body.rating, req.body.date, req.body.summary, req.body.body, req.body.recommend, null, req.body.reviewer_name, req.body.reviewer_email, null, 0];

          return db.client.query(reviewQueryStr, reviewValues);
        })
        .then(data => {

          // // get each characteristic based on review_id
          // // use characteristic_id to get name

          // // gather array of objects data
          //   // each obj has characteristic id
          // var queryStr = `SELECT * FROM characteristic_reviews WHERE review_id = ${data}`;

          // return db.client.query(queryStr)

          var characteristicKeys = Object.keys(req.body.characteristics);

          var characteristicValues = Object.values(req.body.characteristics);

          for (var i = 0; i < characteristicKeys.length; i++) {
            var innerCharQueryStr = `INSERT INTO characteristic_reviews (characteristic_id, review_id, value) VALUES ($1, $2, $3)`;
            var innerCharArray = [characteristicKeys[i], data, characteristicValues[i]];

            db.client.query(innerCharQueryStr, innerCharArray)
          }

          for (var i = 0; i < req.body.photos.length; i++) {
            var revPhotosQueryStr = `INSERT INTO reviews_photos (review_id, url) VALUES ($1, $2)`;
            var photoValues = [data, req.body.photos[i]];

            db.client.query(revPhotosQueryStr, photoValues);
          }
          
        })
        .then(() => {
          db.client.query('COMMIT');
        })
        .then(() => {
          console.log('Transaction completed!');
          db.client.end();
          res.status(201).send();
        })
        .catch(err => {
          console.error("Error received during query: ", err);
          return db.client.query("ROLLBACK");
        })
        .catch(err => {
          console.log("Error received while rolling back transaction: ", err);
        })

    },

    updateHelpfulCount: (req, res) => {

      console.log('req.params: ', req.params);

      var updateQueryStr = `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = ${req.params.review_id}`;

      db.pool.query(updateQueryStr, (err, data) => {
        if (err) {
          console.log(err);
          return;
        } else {
          res.status(200).send(data.rows);
        }
      })

    }
  }
};



// SELECT * FROM reviews INNER JOIN characteristic_reviews ON reviews.id = characteristic_reviews.review_id LIMIT(10);


// var charObject = req.body.characteristics;

// // use a for loop to create a query for each characteristic
// for (var key in charObject) {

//   var charQueryStr = `INSERT INTO characteristics (product_id, name) VALUES (req.body.product_id, ${key})`;

//   // need to convert characteristic id to string name

// }

//   db.pool.query(charQueryStr, characteristicValues, (err, data) => {
//     if (err) {
//       console.log(err);
//       db.pool.release();
//     } else {
//       db.pool.release();
//     }
//   })
// }



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