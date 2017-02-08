var express = require('express');
var router = express.Router();
var config = require('../config/config');
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: config.host,
	user: config.user,
	password: config.password,
	database: config.database,
});

connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
	var getImagesQuery = "SELECT * FROM images";
	connection.query(getImagesQuery, (error,results,fields)=>{
		// grab a random image from the results
		var randomIndex = (Math.floor(Math.random() * results.length));
		// res.json(results[randomIndex]);
		res.render('index', {
			title: 'Electric or Not',
			imageToRender: '/images/'+results[randomIndex].imageUrl,
			imageID: results[randomIndex].id
			// imageToRender: results[randomIndex].imageUrl

		})
	})
});

router.get('/vote/:voteDirection/:imageID', (req,res,next)=>{
	// res.json(req.params.voteDirection);
	var imageID = req.params.imageID;
	var voteD = req.params.voteDirection;
	var insertVoteQuery = "INSERT INTO votes (ipAddress, imageID, voteDirection) Values ('"+req.ipAddress+"',"+imageID+",'"+voteD+"')";
	res.send(insertVoteQuery);
})

module.exports = router;
