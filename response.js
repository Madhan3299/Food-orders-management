function success_response(message,otp,userDetails){
    let response={}
    response.status=true
    response.response=message
    if(otp!=null){
        response.otp=otp
    }
    return response
}

function failure_response(message,userDetails){
    let response={}
    response.status=false
    response.response=message
    if(userDetails!=null){
        response.details=userDetails
    }
    console.log(response);
    return response
}


module.exports={success_response,failure_response}