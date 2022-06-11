const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors= require('cors');
const User=require("./model/user");
const { status } = require('express/lib/response');

const app=express();
app.use(cors());
app.use(express.json());


const mongopass="HelloWorld";
const jwtSecretKey="fuhehfuiRW@j@$)if$q4%nFGEWw7489f4*$q8758h##q$b48U$*";

mongoose.connect(`mongodb+srv://adminTanay:${mongopass}@cluster0.9xyhg.mongodb.net/?retryWrites=true&w=majority`);

app.post('/register', async (req, res) => {
	console.log(req.body);
	try {
		const hashedPass = await bcrypt.hash(req.body.password, 10);
		await User.create({
			name: req.body.name,
			email: req.body.email,
			password: hashedPass,
		})
		res.json({ status: 'ok',message:"User successFully created" })
	} catch (err) {
		console.log(JSON.stringify(err));
		if(err.code===11000)
			res.json({ status: 'error', message: 'Email already exists' });
		else
			res.json({ status: 'error', message: 'Internal error contact administrator' });
	}
});

app.post('/login', async (req, res) => {
	const user = await User.findOne({
		email: req.body.email,
	})

	if (!user) {
		return { status: 'error', error: 'Invalid login' }
	}

	const isPasswordValid = await bcrypt.compare(
		req.body.password,
		user.password
	)

	if (isPasswordValid) {
		const token = jwt.sign(
			{
				name: user.name,
				email: user.email,
			},
			jwtSecretKey
		);

		return res.json({ status: 'ok', user: token });
	} else {
		return res.json({ status: 'error', user: false });
	}
})
app.get('/loginCheck', async (req, res) => {
	const token = req.headers['x-access-token'];

	try {
		const decoded = jwt.verify(token, jwtSecretKey);
		const email = decoded.email;
		const user = await User.findOne({ email: email});
		console.log(user);
		return res.json({ status: 'ok', quote: user.quote });
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' });
	}
});
app.put('/addToWatchlist', async (req, res) => {
	console.log(req.body);
	const token = req.headers['x-access-token'];
	try {
		const decoded = jwt.verify(token, jwtSecretKey)
		const email = decoded.email
		await User.updateOne(
			{ email: email },
			{ $push: { movies : req.body.imdbID } }
		)

		return res.json({ status: 'ok' })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	}
});
app.get('/watchlist', async (req, res) => {
	const token = req.headers['x-access-token'];
	try {
		const decoded = jwt.verify(token, jwtSecretKey);
		const email = decoded.email;
		console.log(email);
		User.findOne({ email: email }).exec()
		.then(docs=>res.json({status:"success",data:docs.movies}))
		.catch(err=>res.json({ status: 'error', error: err }))
    } catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	}
});
app.put('/makepublic', async (req, res) => {
	const token = req.headers['x-access-token'];
	try {
		const decoded = jwt.verify(token, jwtSecretKey)
		const email = decoded.email
		await User.updateOne(
			{ email: email },
			{ public: true}
		)
		return res.json({status:"success",message:"made public"})
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	}
});
app.get('/',async(req,res)=>{
    res.send('Can GET')
})
app.listen(3001,()=>{
    console.log("Listening on port 3001");
})