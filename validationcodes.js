const moment=require('moment')

function generate_secret_code(codeLength){
    let otpLength=codeLength
    let tokenLength=codeLength
    if(otpLength<=6){
        let otpCharacter='0123456789'
        let otp = '';
    for (let i = 0; i < otpLength; i++) {
        const randomIndex = Math.floor(Math.random() * otpCharacter.length);
        otp += otpCharacter[randomIndex];
    }
    return otp;
    }
    else if(tokenLength>=30){
        let tokenCharacter='0123456789QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'
        let token = '';
    for (let i = 0; i < tokenLength; i++) {
        const randomIndex = Math.floor(Math.random() * tokenCharacter.length);
        token += tokenCharacter[randomIndex];
    }
    return token;
    }
}

function current_time(){
    const time=moment().format('HH:mm:ss')
    return time
}

function otp_expire_time(){
    const add=moment().add(2,'m')
    const time=moment(add).format('HH:mm:ss')
    return time
}

function current_date_time(){
    const time=moment().format('YYYY/MM/DD HH:mm:ss')
    return time
}





module.exports={generate_secret_code,current_time,otp_expire_time,current_date_time}