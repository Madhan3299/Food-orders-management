const http=require('http')
const use=require('./user')
http.createServer(use).listen(3232)