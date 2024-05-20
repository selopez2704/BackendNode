const nodemailer = require('nodemailer');
const sgtTransport = require('nodemailer-sendgrid-transport');

let mailConfig;
if (process.env.NODE_ENV === 'production'){
    console.log('XXX-production-XXX');
    const options = {
        auth: {
            api_key: process.env.SENDGRID_API_SECRET
        }
    }
    mailConfig = sgtTransport(options);
}else{
    if (process.env.NODE_ENV === 'staging'){
        console.log('XXX-staging-XXX');
        const options = {
            auth: {
                api_key: process.env.SENDGRID_API_SECRET
            }
        }
        mailConfig = sgtTransport(options);
    }else{
        console.log('XXX-development-XXX');
        mailConfig = {
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.USER_ETHEREAL_MAIL,
                pass: process.env.PASSWORD_ETHEREAL_MAIL
            }
        };
    }

}

module.exports = nodemailer.createTransport(mailConfig);