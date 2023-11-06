const express=require('express')
const mongodb=require('mongodb').MongoClient
const bodyParser=require('body-parser')
const morgan=require('morgan')
const func=require('./function')
const secretCode=require('./validationcodes')
const response=require('./response')
const moment=require('moment')
const bson=require('bson')
const { BSON } = require('mongodb')
const app=express()

app.use(bodyParser.json())
app.use(morgan('combined'))

app.post('/mobileNumberValidation',(req,res)=>{
    let inputData=req.body
    async function numberCheck(){
        let numbervalidate= await func.user_registration(inputData.mobileNumber)
        console.log(numbervalidate);
        if(numbervalidate.length){
            res.send(response.failure_response("User number already registered"))
        }
        else{
            let newUser=await func.user_authentication(inputData.mobileNumber)
            console.log(newUser);
            res.send(newUser)
        }
    }
    numberCheck()
})

app.post('/otpValidation',(req,res)=>{
    let inputData=req.body
    async function id_check(){
        let currentTime=secretCode.current_time()
        let userCheck=await func.user_otp_validate(inputData.otp)
        let arr=userCheck
    if(arr.length==true){
        if(userCheck[0].otpExpire>=currentTime){
            let addToken=await func.create_user_token(userCheck)
            res.send({"user token":addToken,"userId":userCheck[0].userId})
        }
        else{
            res.send({response:"OTP expired"})
        }
    }
    }
    id_check()
})

app.post('/signup',(req,res)=>{
    let inputData=req.body
    let inputOtp=req.headers
    async function newUser(){
        let findUserId=await func.user_otp_validate(inputOtp.otp)
        let findUser= await func.user_identification(findUserId[0])
        let userId=findUserId[0].userId
        if(findUser.length){
            res.send(response.failure_response("User already registered"))
        }else{
            let user=await func.new_user_sigup(inputData,userId)
            res.send(response.success_response("user details resgistered successfully",user))
        }
    }
    newUser()
})

app.post('/vehicleregistration',(req,res)=>{
    let inputOtp=req.headers
    let inputData=req.body
    async function vehicleregister(){
    let findUserId=await func.user_otp_validate(inputOtp.otp)
    let findUser= await func.user_identification(findUserId[0])
    let findVehicle = await func.vehicle_identification(inputData)
    console.log(findVehicle);
    let userId=findUserId[0].userId
    if(findUser[0].userId==userId){
        if(findVehicle.length){
            res.send(response.failure_response("User already registered"))
        }
        else{
            let user=await func.new_employee_vehicle_register(inputData,userId)
            res.send(response.success_response("vehicle details resgistered successfully",user))
        }
    }
    else{
        res.send(response.failure_response("User not found"))
    } 
    }
    vehicleregister()
})


app.post('/hotelregistration',(req,res)=>{
    let inputData=req.body
    async function hotelregistration(){
        let findHotel= await func.hotel_search_byname(inputData)
        if(!findHotel.length){
            let user = await func.new_hotel_registration(inputData)
            res.send(response.success_response("Hotel details resgistered successfully",user))
        }
        else{
            res.send(response.failure_response("Hotel details already registered"))
        }
        // res.send(findHotel)
        console.log(findHotel);
    }
    hotelregistration()
}) 

app.post('/itemslistresgistration',(req,res)=>{
    let inputData=req.body
    let inputId=new BSON.ObjectId(req.headers.hotelid)
    async function itemslistresgistration(){
        let hotelFind = await func.hotel_search_byId(inputId)
        let itemSearch = await func.items_search(inputData,inputId)
        if(hotelFind.length){
            if(itemSearch.length){
                res.send(response.failure_response("Item already added in hotel menu"))
            }
            else{
                let user = await func.items_register(inputData,hotelFind[0]._id)
                res.send(response.success_response("Item details added successfully",user))
            }
        }
    }
    itemslistresgistration()
})

app.post('/orderdetails',(req,res)=>{
    let inputData=req.body
    let inputId=req.headers.userid
    let itemId = new BSON.ObjectId(inputData.itemId)
    async function orderdetails(){
        let findItem = await func.orderdetails_items_search(itemId)
        let totalPrice = (findItem[0].price)*(inputData.quantity)  
        let orderList=[{itemId:inputData.itemId,quantity:inputData.quantity,price:findItem[0].price}] 
        let orderStatus=["Confirmed","Pending","Cancelled"]
        let orderDate=moment().format('YYYY/MM/DD HH:mm:ss')
        let orderDetailsSearch = await func.order_details_search(inputId,orderList)
        if(orderDetailsSearch.length){
            res.send(response.failure_response("order already placed"))
        }
        else{
            if(findItem.length){
                let user = await func.orderdetails_register(inputId,findItem,totalPrice,orderList,orderStatus,orderDate)
                res.send(response.success_response("Order placed successfully",user))
            }
            else{
                res.send(response.failure_response("item not found"))
            }
        }
    }
    orderdetails()
})

app.post('/payment',(req,res)=>{
    let inputData = req.body
    let inputId = new BSON.ObjectId(req.headers.orderid)
    async function payment(){
        let findOrder = await func.order_find(inputId)
        if(findOrder.length){
            if(findOrder[0].orderPrice == inputData.amount){
                let user = await func.order_user_payment_details_register(inputData,inputId)
                res.send(response.success_response("Order payment paid successfully",user))
            }
            else{
                res.send(response.failure_response("Order details and payment not found"))
            }
        }
        else{
            res.send(response.failure_response("Order not found"))
        } 
    }
    payment()
})

app.post('/vieworders',(req,res)=>{
    const orderId = new BSON.ObjectId(req.body.orderId)
    const userId = new BSON.ObjectId(req.headers.userid)
    async function vieworders(){
        const findOrders = await func.order_find(orderId)
        const itemId = new BSON.ObjectId(findOrders[0].orderList[0].itemId)
        const itemSearch = await func.view_items(itemId)
        let orderModify = [...findOrders]
        orderModify[0].orderList[0]={"itemDetails":itemSearch,"quantity":orderModify[0].orderList[0].quantity}
        res.status(200).send(...orderModify)        
    }
    vieworders()
})

app.post('/deliverydetails',(req,res)=>{
    const orderId = new BSON.ObjectId(req.body.orderId)
    const assignedID = {userId:req.headers.deliverypersonid}
    async function deliverydetails(){
        let isComplete = false
        const userCheck = await func.user_identification(assignedID) 
        const findOrders = await func.order_find(orderId)
        const officialNumber = 7144376083
        if(userCheck.length){
            isComplete = true
            let otp = await secretCode.generate_secret_code(4)
            let vehicleDetails = await func.vehicle_details(userCheck[0].userId)
            if(vehicleDetails.length){
                let outputData = {orderId:orderId,orderDetails:findOrders,assignedID:assignedID.userId,deliveryPersonName:userCheck[0].name,officialNumber:officialNumber,isComplete:isComplete,otp:otp}
                let user = await func.delivery_details_register(outputData)
                res.send(response.success_response("Delivery details added successfully",user))                
            }
            else{
                res.send(response.failure_response("vehicle details not found for corresponding assigned ID"))
            }
        }
        else{
            res.send(response.failure_response("Delivery person details not found"))
        }
    }
    deliverydetails()
})


module.exports=app
