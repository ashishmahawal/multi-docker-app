const keys = require('./keys')
const redis = require('redis')

const redisClient = redis.createClient({
    host:keys.redisHost,
    port:keys.redisPort,
    retry_strategy:()=>1000
});
redisClient.on("ready", function(connect) {
    console.log('ready')
  });
const sub = redisClient.duplicate();

function fib(index){
   
    return index<2?1:fib(index-1) + fib(index-2)
}

sub.on('message',(channel,message)=>{
   const res = fib(parseInt(message))
    redisClient.hset('values',message,res)
    console.log(res)
})

sub.subscribe('insert');