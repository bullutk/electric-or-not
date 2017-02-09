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

// ********MULTER********
//include multer module
var multer = require('multer');
// upload is the multer module with a dest object passed to it
var upload = multer({ dest: 'public/images' });
// specify the type for use later, it comes from upload
var type = upload.single('imageToUpload');
//we need filesystem to read the file, its part of core
var fs = require('fs')

/* GET home page. */
router.get('/', function(req, res, next) {
	// var getImagesQuery = "SELECT * FROM images";
	var getImagesQuery = "select * from images where id not in" + 
		"(select ImageID from votes where ipAddress = '"+req.ip+"');";

	connection.query(getImagesQuery, (error,results,fields)=>{
		// grab a random image from the results
		var randomIndex = (Math.floor(Math.random() * results.length));
		// res.json(results[randomIndex]);
		if(results.length == 0){
			res.render('index', { msg: "noImages"} );
		}
		res.render('index', {
			title: 'Electric, Gas or Hybrid?',
			imageToRender: '/images/'+results[randomIndex].imageUrl,
			imageID: results[randomIndex].id
			// msg: imageOrNot
			// imageToRender: results[randomIndex].imageUrl
		})
	})
});

router.post('/vote/:voteDirection/:imageID', (req,res,next)=>{
	// res.json(req.params.voteDirection);
	var imageID = req.params.imageID;
	var voteD = req.body.vote;
	var insertVoteQuery = "INSERT INTO votes (ipAddress, imageID, voteDirection) Values ('"+req.ip+"',"+imageID+",'"+voteD+"')";
	// res.send(insertVoteQuery);
	// res.json(req.body);
	connection.query(insertVoteQuery, (error,results,field)=>{
		if(error) throw error;
		res.redirect('/')
	})
})

router.get('/standings', (req,res,next)=>{
	res.render('standings', {  })
})

router.get('/testQ', (req, res, next)=>{
	var id = 5;
	var query = "select * from images where id>?";
	connection.query(query, [id], (error,results,fields)=>{
		res.json(results);
	})
});

router.get('/uploadImage', (req,res,next)=>{
	res.render('uploadImage', {});
});

router.post('/formSubmit', type, (req,res,next)=>{
	// res.json(req.file);
	// save the path where the file is temp
	var tmpPath = req.file.path;
	// set up the target path plus the original name of the file
	var targetPath = 'public/images/'+req.file.originalname;
	// use fs module to read the file then wright it to the correct place
	fs.readFile(tmpPath, (error,fileContents)=>{
		fs.writeFile(targetPath, fileContents, (error)=>{
			if (error) throw error;
			var insertQuery = "insert into images (imageUrl) value (?)";
			connection.query(insertQuery, [req.file.originalname], (error,results,fields)=>{
				if (error) throw error;
				res.redirect('/?file="uploaded')
			})
			res.json("Uploaded")
		})
	});
});

module.exports = router;
