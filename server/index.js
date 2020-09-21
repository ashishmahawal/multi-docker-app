const keys = require('./keys')
const redis = require('redis')
//Express App
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express();
app.use(cors());
app.use(bodyParser.json());

//Postgres client setup

const {Pool} = require('pg')
const pgClient = new Pool({
    user:keys.pgUser,
    host:keys.pgHost,
    port:keys.pgPort,
    database:keys.pgDatabase,
    password:keys.pgPassword
})

pgClient.on('connect', () => {
    pgClient
      .query('CREATE TABLE IF NOT EXISTS values (number INT)')
      .catch((err) => console.log(err))
  })
// Redis client setup

const redisClient = redis.createClient({
    host:keys.redisHost,
    port:keys.redisPort,
    retry_strategy:()=>1000
});

const redisPublisher = redisClient.duplicate()

//Express Route Handlers

app.get('/',(req,res) => {
    res.send('Hi')
})

app.get('/values/all',async (req,res)=>{
    const values = await pgClient.query('SELECT * from values')
    res.send(values.rows)
    console.log(values)
})

app.get('/values/current',async (req,res)=>{
    redisClient.hgetall('values',(err,values)=>{
        console.log('In the redis cache.....')
        res.send(values)
    })
})

app.post('/values',async (req,res)=>{
    const index = req.body.index;
   // console.log('Endpoint hit.....')
    if(parseInt(index)>40){
        res.status(422).send('Index too high')
    }
    
    redisClient.hset('values',index,'Nothing yet!')
    redisClient.publish('insert',index)
    pgClient.query('INSERT INTO values(number) VALUES($1)',[index])
    res.send({working: true})
})

app.listen(5000,err=>{
    console.log('Listening on port 5000......')
})