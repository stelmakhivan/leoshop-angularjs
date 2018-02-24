const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
const twilio = require('twilio');
const clientTwilio = new twilio('AC45fd8dfe213ea9305fe3322a44aa2bb7', '64fc7649d47a4b04d8b74e50232040aa');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const server = require('http').Server(app);
const io = require('socket.io')(server);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + ".jpg");
    }
});

const upload = multer({
    storage: storage
});

//script read/write in .txt file
require('./js/about-item');

//script with login and password from mail
const mail = require('./js/mail');
//connect to mail
const nodemailer = require('nodemailer'),
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: mail.mail,
            pass: mail.pass
        },
    }),
    EmailTemplate = require('email-templates').EmailTemplate,
    path = require('path'),
    Promise = require('bluebird');
const port = 8000;

function sendEmail(obj) {
    return transporter.sendMail(obj);
}

function loadTemplate(templateName, contexts) {
    let template = new EmailTemplate(path.join(__dirname, 'mail_templates', templateName));
    return Promise.all(contexts.map((context) => {
        return new Promise((resolve, reject) => {
            template.render(context, (err, result) => {
                if (err) reject(err);
                else resolve({
                    email: result,
                    context,
                });
            });
        });
    }));
};

//client's part of site in 'public' folder
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));
// app.use(cors());
//MYSQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'komora'
});
// Create user's table
let initDb = function () {
    connection.query('' +
        'CREATE TABLE IF NOT EXISTS users (' +
        'id int(11) NOT NULL AUTO_INCREMENT,' +
        'login varchar(50), ' +
        'password varchar(50),' +
        'PRIMARY KEY(id), ' +
        'UNIQUE INDEX `login_UNIQUE` (`login` ASC))',
        function (err) {
            if (err) throw err;
            //додати адміна в таблицю юзерів(якщо не має)
            console.log('CREATE TABLE IF NOT EXISTS users');

        });
};

initDb();
io.sockets.on('connection', function (socket) {
    console.log('user connected');

    //    Authorization
    socket.on('logIn', function (data) {
        connection.query('SELECT * FROM users', function (err, rows) {
            if (err) throw err;
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].login == data.login) {
                    if (rows[i].password == data.password) {
                        socket.emit('logIn', rows[i].login);
                        break;
                    } else {
                        socket.emit('logIn', 'Wrong Password');
                        break;
                    }
                } else {
                    if (i == rows.length - 1) {
                        socket.emit('logIn', 'Wrong Login');
                    }
                }
            }
        });
    });

    //    Registration
    socket.on('signUp', function (data) {
        connection.query('SELECT * FROM users  WHERE login = ?', data.login, function (err, rows) {
            if (err) throw err;
            if (rows[0] == undefined) {
                connection.query('SELECT * FROM users  WHERE mail = ?', data.mail, function (err, rows) {
                    if (err) throw err;
                    if (rows[0] == undefined) {
                        connection.query('INSERT INTO users SET login = ? , password = ? , mail = ?', [data.login, data.password, data.mail], function (err, result) {
                            if (err) throw err;
                            console.log('user added to database with id: ' + result.insertId);
                            socket.emit('signUp', data.login);
                        });
                    }
                    else {
                        socket.emit('signUp', "pls choose another mail");
                        // res.status(200).send("pls choose another mail");
                    }
                });
            }
            else {
                socket.emit('signUp', "pls choose another login");
                // res.status(200).send("pls choose another login");
            }
        })
    });
    // remind password
    socket.on('remind', function(data){
        connection.query('SELECT * FROM users  WHERE mail = ?',data.mail, function (err, rows) {
            if (err) throw err;
            if (rows[0] != undefined) {
                loadTemplate('forget-password', rows).then((results) => {
                    return Promise.all(results.map((result) => {
                        sendEmail({
                            to: data.mail,
                            from: 'a@gmail.com',
                            subject: result.email.subject,
                            html: result.email.html,
                            text: result.email.text,
                        });
                    }));
                }).then(() => {
                    socket.emit('remind', "Send password");
                });

            } else {
                socket.emit('remind', "Wrong email");
            }
        });
    });
    // get all items
    socket.on('getItems', function(data){
        connection.query('SELECT * FROM leoshop', function (err, rows) {
            if (err) throw err;
            console.log('get all items, length: ' + rows.length);
            socket.emit("getItems", rows);
        });
    });
    // write item
    socket.on('items', function(data){
        connection.query('INSERT INTO leoshop SET name = ? , price = ? , new = ?, imgSrc = ?', [data.name, data.price, data.new, data.imgSrc], function (err, result) {
                if (err) throw err;
                console.log('item added to database with id: ' + result.insertId);
            }
        );
        socket.emit("items", data.name);
    })
});

//receive users
// app.post('/users', function (req, res) {
//     connection.query('SELECT * FROM users', function (err, rows) {
//         if (err) throw err;
//         for(var i = 0; i <rows.length; i++){
//             if(rows[i].login==req.body.login){
//                 if(rows[i].password==req.body.password) {
//                     res.status(200).send(rows[i].login);
//                     break;
//                 }else {
//                     res.status(200).send("Wrong Password");
//                     break;
//                 }
//             }else {
//                 if(i == rows.length - 1) {
//                     res.status(200).send("Wrong Login");
//                 }
//             }
//         }
//     });
// });
//remind password
// app.post('/remind', function (req, res) {
//     connection.query('SELECT * FROM users  WHERE mail = ?',req.body.mail, function (err, rows) {
//         if (err) throw err;
//         if (rows[0] != undefined) {
//             loadTemplate('forget-password', rows).then((results) => {
//                 return Promise.all(results.map((result) => {
//                     sendEmail({
//                         to: req.body.mail, // замінити на свою пошту
//                         from: 'a@gmail.com',
//                         subject: result.email.subject,
//                         html: result.email.html,
//                         text: result.email.text,
//                     });
//                 }));
//             }).then(() => {
//                 res.status(200).send("Sent password!");
//             });
//
//         } else {
//             res.status(200).send("wrong mail");
//         }
//     });
// });
//Twilio
app.post('/testtwilio', function (req, res) {
    clientTwilio.messages.create({
        body: req.body.code,
        to: req.body.number,
        from: '+14146221946' // valid Twilio number +1 575-479-7458 without symbols +,- and ' '
    })
        .then((message) => console.log(message.sid));
    res.sendStatus(200);
});
//create user
// app.post('/signUp', function (req, res) {
//     console.log(req.body.mail);
//     //Перевірка чи такий користувач вже є
//     connection.query('SELECT * FROM users  WHERE login = ?', req.body.login, function (err, rows) {
//         if (err) throw err;
//         if (rows[0] == undefined) {
//             connection.query('SELECT * FROM users  WHERE mail = ?', req.body.mail, function (err, rows) {
//                 if (err) throw err;
//                 if (rows[0] == undefined) {
//                     connection.query('INSERT INTO users SET login = ? , password = ? , mail = ?', [req.body.login, req.body.password, req.body.mail], function (err, result) {
//                         if (err) throw err;
//                         console.log('user added to database with id: ' + result.insertId);
//                         res.status(200).send(req.body.login);
//                     });
//                 }
//                 else {
//                     res.status(200).send("pls choose another mail");
//                 }
//             });
//         }
//         else {
//             res.status(200).send("pls choose another login");
//         }
//     })
// });

//receive items from db
// app.get('/items', function (req, res) {
//     connection.query('SELECT * FROM leoshop', function (err, rows) {
//         if (err) throw err;
//         console.log('get all items, length: ' + rows.length);
//         res.status(200).send(rows);
//     });
// });
//Upload images
app.post('/images', upload.any(), function (req, res, next) {
    res.sendStatus(200);
})
//write items in db
// app.post('/items', function (req, res) {
//     connection.query('INSERT INTO leoshop SET ?', req.body,
//         function (err, result) {
//             if (err) throw err;
//             console.log('item added to database with id: ' + result.insertId);
//         }
//     );
//     res.sendStatus(200);
// });

//write/read item info in/from .txt file
//read
app.get('/items-info', function (req, res) {
    var str = new ItemsInfo().readInfo().toString().split('/item/');
    res.status(200).send(str);
});

//write
app.post('/items-info', function (req, res) {
    var str = new ItemsInfo().readInfo().toString();
    if (str == "") {
        str = str + req.body.text;
    } else {
        str = str + "/item/" + req.body.text;
    }
    var str2 = new ItemsInfo().writeInfo(str);
    res.sendStatus(200);
});
//Upload images
app.post('/images', upload.any(), function (req, res, next) {
    res.sendStatus(200);
});

//Client's Angular control all adresses
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

//Run server
server.listen(port, function (err) {
    if (err) throw err;
    console.log('Server start on port 8000!');
});