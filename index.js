var express = require('express')
var app = express()
var  ejs = require('ejs');
var passwordHash = require('password-hash');
const v = require('body-parser');
app.use(express.static('public'));
app.set('view engine','ejs');
app.use(v.urlencoded({extended:true}))

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
var serviceAccount = require("./key.json");

initializeApp({
   credential: cert(serviceAccount)
  });
  const db = getFirestore();

app.get('/', function (req, res)  {
    res.render( __dirname + "/views/" + "signup.ejs",{data1:""});

})
app.get('/login', function (req, res) {
    res.render( __dirname + "/views/" + "login.ejs",{data2:""});
    

})
app.get('/hi',(req,res)=>{
    res.render(__dirname +"/views/hi.ejs");
});


app.get('/payment',(req,res)=>{
    res.render(__dirname +"/views/payment2.ejs");
})
app.post('/hi',(req,res)=>{
    res.redirect("/payment");
})


app.post('/signup', (req, res) => {
  const email = req.body.email;
 const  name=req.body.name;
  // Check if the email already exists in the database
  console.log(email);
  console.log(name);
  db.collection('Database')
      .where('Email', '==', email).where('Fullname', '==', name)
      .get()
      .then((docs) => {
          if (!docs.empty) {
            
              res.render('login.ejs', { data1: 'Email/Username already exists' });
          } else {
            
              db.collection('Database')
                  .add({
                      Fullname: name,
                      Email: email,
                      Password:passwordHash.generate(req.body.password)
                  })
                  .then(() => {
                      res.redirect('/login');
                  })
                  .catch((error) => {
                      console.error('Error adding document: ', error);
                      res.render('signup.ejs', { data1: 'Signup failed' });
                  });
          }
      })
      .catch(() => {
          
          res.render('signup.ejs', { data1: 'Signup failed' });
      });
});


    app.post('/login',  (req, res) => {
      
      
        db.collection('Database').where("Email","==",req.body.email)
      
        .get().then((docs)=>{
          
            if(docs.size > 0){
              const user = docs.docs[0].data();
              const hashedPassword =user.Password;
            if(passwordHash.verify(req.body.password, hashedPassword)){
               res.redirect("/hi");
            }
            else{
                res.render("login.ejs",{data2:"Login Fail"});
            }
          }else{
            res.render("login.ejs",{data2:"Login Fail"});
          }
            
        });
    });





    app.listen(3000, () => {
      console.log('Server is running on port 3001');
    });