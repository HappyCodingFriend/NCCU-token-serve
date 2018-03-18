const express = require('express')
const router = express.Router()

// sign with default (HMAC SHA256)
const jwt = require('jsonwebtoken')

const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')

const fs = require('fs')
const contracts = JSON.parse(fs.readFileSync('./contract/contracts.json'))

const mysql = require('../library/mysql')
mysql.connect()

const point = new Map()
point.set('dormitory', '0x2CA6Dacbf2db0e04c8f7A73E27C385129A2b40cf')

let jwtCheck = async function (req, res, next) {
	console.log('jwt check')

	console.log(req.body)
	let decoded = jwt.verify(req.body.token, 'secret', function (err, decoded) {
		if (err) {
			console.error(err)
			res.status(400).send({ error: 'jwtInvalidError' })
		}
		else {
			console.log(decoded)
			next()
		}
	})
}

// 帳號管理
router.route('/user')
	//登入
	.get(async function (req, res) {
		console.log('sign_in')
		console.log(req.query)

		if (!(req.query.ID && req.query.password)) {
			res.status(200).json({ type: false, inf: '資料缺失' })
		}
		else {
			let result = await mysql.sing_in(req.query.ID, req.query.password)
			if (result.type) {
				let data = {
					ID: result.ID,
					name: result.name,
					address: result.address,
				}
				let time = {
					expiresIn: '1h'
				}
				result.token = jwt.sign(data, 'secret', time)
			}
			console.log(result)
			res.status(result.code).json(result)
		}
	})
	//註冊
	.post(async function (req, res) {
		console.log('sign_up')
		console.log(req.body)

		if (!(req.body.ID && req.body.password && req.body.name && req.body.email)) {
			res.json({ type: false, inf: '資料缺失' })
		}
		else {
			let result = await mysql.sing_up(req.body.ID, req.body.password, req.body.name, req.body.email)
			res.json(result)
		}
	})
	//更新
	.put(jwtCheck, function (req, res, next) {
		console.log('sign_update')
		res.json({ '123': 123 })
	})
	//登出
	.delete(jwtCheck, function (req, res, next) {
		console.log('sign_out')
		res.json({ '123': 123 })
	})

// 好友管理
router.get('friend', async function (req, res) {

})
router.route('friend/:friendID')
	//取得好友
	.get(async function (req, res) {

	})
	//新增好友
	.post(async function (req, res) {

	})
	//刪除好友
	.delete(async function (req, res) {

	})

// 收支功能
router.route('/transaction')
	//收款
	.get(async function (req, res) {

	})
	//付款
	.post(async function (req, res) {
		console.log('payment')
		console.log(req.body)

		web3.eth.sendSignedTransaction(req.body.tx)
			.on('receipt', function (result) {
				console.log(result)
				res.send(result)
			})
			.on('error', function (err) {
				console.log(err)
				res.send(err)
			})
	})

//發送交易
router.post('/transaction', function (req, res, next) {
	web3.eth.sendSignedTransaction(req.body.tx)
		.on('receipt', function (result) {
			console.log(result)
			res.send(result);
		})
		.on('error', function (err) {
			console.log(err);
			res.send(err)
		})
})

// 查詢系統
router.get('/query/balance/:point', async function (req, res) {
	console.log('balance')

	console.log(req.params.point)
	console.log(req.query.address)

	let contract = new web3.eth.Contract(contracts.ERC223Token.abi)
	contract.options.address = point.get(req.params.point)
	contract.methods.balanceOf(req.query.address).call().then(function (result) {
		console.log(result)
		res.send(result)
	})
})
router.get('/query/transaction', async function (req, res) {

})
router.get('/query/transaction/:transactionID', async function (req, res) {

})

module.exports = router
