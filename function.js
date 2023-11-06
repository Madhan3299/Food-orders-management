const mongodb=require('mongodb').MongoClient
const port="mongodb://0.0.0.0:27017"
const database="Zomato_task"
const client=new mongodb(port)
const otp=require('./validationcodes')
const {v4:uuidv4}=require('uuid')
const functions=require('./validationcodes')


async function user_registration(data){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('user_authentication')
    const query=await dbCollection.find({otp:data}).toArray()
    return query
}

async function new_user_sigup(data,userId){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('user_details')
    let query=await dbCollection.insertOne({userId:userId,name:data.name,mobileNumber:data.mobileNumber,email:data.email,isSupplier:data.isSupplier})
    return query
}

async function user_authentication(data){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('user_authentication')
    const getOtp=otp.generate_secret_code(6)
    let otpExpireTime=otp.otp_expire_time()
    let uuid=uuidv4()
    let query=await dbCollection.insertOne({userId:uuid,otp:getOtp,otpExpire:otpExpireTime}) 
    if(query.acknowledged==true){
        let migerateData=[uuid,getOtp,otpExpireTime]
        return migerateData
    }
}

async function user_identification(data){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('user_details')
    let query = await dbCollection.find({userId:data.userId}).toArray()
    return query
}

async function user_otp_validate(data){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('user_authentication')
    let currentTime=otp.current_time()
    // let otpExpireTime=otp.otp_expire_time()
    let query= await dbCollection.find({otp:data}).toArray()
    return query
}

async function create_user_token(data){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('token')
    let token=otp.generate_secret_code(32)
    let currentDateTime=otp.current_date_time()
    let query= await dbCollection.insertOne({userId:data[0].userId,token:token,createdAt:currentDateTime})
    if(query.acknowledged==true){
        return token
    }
}

async function new_employee_vehicle_register(data,userId){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('vehicle_details')
    let query=await dbCollection.insertOne({userId:userId,vehicleModel:data.vehicleModel,vehicleNumber:data.vehicleNumber,licenseNumber:data.licenseNumber,vehicleColour:data.vehicleColour})
    return query
}

async function vehicle_identification(data){
    const dbClient = await client.connect()
    const db = dbClient.db(database)
    const dbCollection = db.collection('vehicle_details')
    let query = await dbCollection.find({vehicleNumber:data.vehicleNumber,licenseNumber:data.licenseNumber }).toArray()
    return query
}

async function vehicle_details(userId){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('vehicle_details')
    let query=await dbCollection.find({userId:userId}).toArray()
    return query
}

async function hotel_search_byname(data){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('hotels&restaurants')
    let query=await dbCollection.find({hotelName:data.hotelName,place:data.place}).toArray()
    return query
}

async function hotel_search_byId(data){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('hotels&restaurants')
    let query=await dbCollection.find({_id:data}).toArray()
    return query
}

async function new_hotel_registration(data){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('hotels&restaurants')
    let query=await dbCollection.insertOne({hotelName:data.hotelName,place:data.place,rating:data.rating,category:data.category})
    return query
}

async function items_register(data,hotelId){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('items')
    let query=await dbCollection.insertOne({hotelId:hotelId,dishName:data.dishName,price:data.price,image:data.image,stocks:data.stocks,category:data.category})
    return query
}

async function  items_search(data,id){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('items')
    let query=await dbCollection.find({hotelId:id,dishName:data.dishName}).toArray()
    return query
}

async function  view_items(data){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('items')
    let query=await dbCollection.find({_id:data}).toArray()
    return query
}

async function  orderdetails_items_search(data){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('items')
    let query=await dbCollection.find({_id:data}).toArray()
    return query
}

async function orderdetails_register(userId,findItem,totalPrice,orderList,orderStatus,orderDate){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('order_details')
    let query = await dbCollection.insertOne({customerId:userId,orderDate:orderDate,orderList:orderList,orderPrice:totalPrice,orderStatus:orderStatus[0]})
    return query
}

async function order_details_search(userId,orderList){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('order_details')
    let query = await dbCollection.find({customerId:userId,orderList:orderList}).toArray()
    return query
}

async function order_find(data){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('order_details')
    let query = await dbCollection.find({_id:data}).toArray()
    return query
}

async function order_user_payment_details_register(data,userId){
    const dbClient=await client.connect()
    const db=dbClient.db(database)
    const dbCollection=db.collection('user_payment_details')
    let query = await dbCollection.insertOne({userId:userId,UPIId:data.UPIID,mobileNumber:data.mobileNumber,paymentMethod:data.paymentMethod,amount:data.amount})
    return query
}

async function delivery_details_register(data){
    const dbClient = await client.connect()
    const db = dbClient.db(database)
    const dbCollection = db.collection('delivery_details')
    let query = await dbCollection.insertOne({orderId:data.orderId,orderDetails:data.orderDetails,assignedID:data.assignedID,deliveryPersonName:data.deliveryPersonName,officialNumber:data.officialNumber,isComplete:data.isComplete,otp:data.otp})
    return query
}

module.exports={user_registration,new_user_sigup,user_authentication,user_otp_validate,
    create_user_token,user_identification,new_employee_vehicle_register,vehicle_details,new_hotel_registration,
    hotel_search_byname,hotel_search_byId,items_register,items_search,orderdetails_items_search,
    orderdetails_register,order_details_search,order_find,order_user_payment_details_register,view_items,
    delivery_details_register,vehicle_identification
}
