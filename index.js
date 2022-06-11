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
	try {
		const hashedPass = await bcrypt.hash(req.body.password, 10);
		await User.create({
			name: req.body.name,
			email: req.body.email,
			password: hashedPass,
		})
		res.json({ status: 'ok',message:"User successFully created" })
	} catch (err) {
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
		return res.json({ status: 'error', error: 'Invalid login' });
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
		return res.json({ status: 'ok', message: "success signed-in" });
	} catch (error) {
		res.json({ status: 'error', error: 'invalid token' });
	}
});
app.put('/addToWatchlist', async (req, res) => {
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
		res.json({ status: 'error', error: 'invalid token' })
	}
});
app.get('/watchlist', async (req, res) => {
	const token = req.headers['x-access-token'];
	try {
		const decoded = jwt.verify(token, jwtSecretKey);
		const email = decoded.email;
		User.findOne({ email: email }).exec()
		.then(docs=>res.json({status:"success",data:docs.movies}))
		.catch(err=>res.json({ status: 'error', error: err }))
    } catch (error) {
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
		res.json({ status: 'error', error: 'invalid token' })
	}
});
app.put('/makeprivate', async (req, res) => {
	const token = req.headers['x-access-token'];
	try {
		const decoded = jwt.verify(token, jwtSecretKey)
		const email = decoded.email
		await User.updateOne(
			{ email: email },
			{ public: false}
		)
		return res.json({status:"success",message:"made private"})
	} catch (error) {
		res.json({ status: 'error', error: 'invalid token' })
	}
});
app.get('/watchlist/:email', async function(req, res) {
    // Retrieve the tag from our URL path
	try{
    var email = req.params.email;
	const token = req.headers['x-access-token'];
    let user = await User.findOne({email: email}).exec();
	if(user.public)
	{
		res.json(user.movies);
	}
	else
	{
		const decoded = jwt.verify(token, jwtSecretKey);
		const useremail = decoded.email;
		if(useremail==email)
		{
			res.json(user.movies);
		}
		else
		{
			res.send({message:"private watchlist please login with correct ID"})
		}
	}
}
catch{
	res.json({status:"error",message:"internal error"});
}
});
app.get('/',async(req,res)=>{
    res.send('Can GET')
})
app.listen(3001,()=>{
    console.log("Listening on port 3001");
})