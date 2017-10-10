// BASE SETUP
// =============================================================================
/**
 *
 *
 *
 *  Kill mongo instance and delete diagnostic data !!!!
 rm -f  /var/lib/mongo/diagnostic.data/*

 */

// call the packages we need
var fs = require('fs');
var https = require('https');
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var cors = require('cors');

// use it before all route definitions
// app.use(cors({origin: 'http://localhost:3000'}))
app.use(cors())

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 8080 // 55555; //set our port

var mongoose   = require('mongoose');
var url = 'mongodb://localhost:27017/krazy';
mongoose.connect(url, function(err, db) {
  console.log("Connected correctly to DB server");
});

// connect to our database
var Users     = require('./app/models/user');
var List     = require('./app/models/list');
var Item     = require('./app/models/item');

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening. Pass param to console log it');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// on routes that end in /users
// ----------------------------------------------------
router.route('/users')

	// create a user (accessed at POST http://localhost:8080/users)
	.post(function(req, res) {

    // Pass to next layer of middleware
		var user = new Users();		// create a new instance of the Users model
		user.name = req.body.name;  // set the users name (comes from the request)

		user.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'Users created!' });
		});
	})

	// get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		Users.find(function(err, users) {
			if (err)
				res.send(err);

			res.json(users);
		});
	});

// on routes that end in /users/:user_id
// ----------------------------------------------------
router.route('/users/:user_id')

	// get the user with that id
	.get(function(req, res) {
		Users.findById(req.params.user_id, function(err, user) {
			if (err)
				res.send(err);
			res.json(user);
		});
	})

	// update the user with this id
	.put(function(req, res) {
		Users.findById(req.params.user_id, function(err, user) {

			if (err)
				res.send(err);

			user.name = req.body.name;
			user.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Users updated!' });
			});

		});
	})

	// delete the user with this id
	.delete(function(req, res) {
		Users.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err)
				res.send(err);
			res.json({ message: 'Successfully deleted' });
		})
	})

router.route('/items/:list_id')
  .get(function(req, res) {
    List.findById(req.params.list_id, function(err, list) {
      if (err)
        res.send(err)

      res.json(list.items);
    })
  })
  .post(function (req, res) {
    //https://stackoverflow.com/questions/33049707/push-items-into-mongo-array-via-mongoose
    var item = new Item()
    item.name = req.body.name
    item.completed = req.body.completed

    List.findById(req.params.list_id, function(err, list) {
      if (err)
        res.send(err)
      list.items.push(item)
      list.save()
      res.json({message: 'Item was added in '+list._id})
    })
    //.delete(function (req, res) {})
  })


router.route('/lists/:list_id')
  // get the user with that id
  .get(function(req, res) {
    List.findById(req.params.list_id, function(err, list) {
      if (err)
        res.send(err)
      res.json(list)
    })
  })
  .post(function (req, res) {
    var list = new List()
    list.title = req.body.title;

    list.save(function (err) {
      if (err)
        res.send(err)
      res.json({message: 'LIST created!'});
    })
  })

  router.route('/lists/:list_id')
  .delete(function (req, res) {
    List.remove({
      _id: req.params.list_id
    }, function (err, list) {
      if (err)
        res.send(err);
      res.json({message: 'Successfully deleted'});
    })
  })

  router.route('/lists')
  .post(function (req, res) {
    var list = new List()
    list.title = req.body.title;

    list.save(function (err) {
      if (err)
        res.send(err)
      res.json({message: 'LIST created!'});
    })
  })
  .get(function(req, res) {
    List.find(function(err, lists) {
      if (err)
        res.send(err);

      res.json(lists);
    });
  });

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================

//http://blog.mgechev.com/2014/02/19/create-https-tls-ssl-application-with-express-nodejs/
//https://stackoverflow.com/questions/31254725/transport-security-has-blocked-a-cleartext-http
// https.createServer({
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
//   //passphrase: <passphraseusedwhilecreatingcertificate>
// }, app).listen(port);

app.listen(port);
console.log('Magic happens on port ' + port);
