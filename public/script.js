var firebaseConfig = {
    apiKey: "AIzaSyC8maSj6DK7bVC7UfdcxK5H_69h4GSFY2Q",
    authDomain: "casper-elife-training-bot.firebaseapp.com",
    databaseURL: "https://casper-elife-training-bot-default-rtdb.firebaseio.com",
    projectId: "casper-elife-training-bot",
    storageBucket: "casper-elife-training-bot.appspot.com",
    messagingSenderId: "15575726467",
    appId: "1:15575726467:web:ee04c14950bdcf1f255eb6",
    measurementId: "G-TS0F77MQ04"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var loginBtn = document.getElementById("loginBtn");
var tokenInput = document.getElementById("tokenInput");

function login(){
  
  let auth = firebase.auth();
  
  let token = tokenInput.value;

  let promisse = auth.signInWithEmailAndPassword("logincomtoken@casperbot.elifetraining.com", token);
  
  promisse.catch(e =>{
    console.error(e);
  });
  
  promisse.then(e =>{
    console.log(e);
  })

  //dj4EyD7ZPrY5LkN
}

loginBtn.addEventListener('click', login);

document.addEventListener ('keypress', (event) => {
  const keyName = event.key;
  if(keyName == 'Enter' && tokenInput.value != ''){
    login();
  }
});

firebase.auth().onAuthStateChanged(user =>{
  if(user){
    console.log(user);
    if(window.location.href != 'https://casperbot-elifetraining.glitch.me/gerenciamento'){
      window.location.replace('https://casperbot-elifetraining.glitch.me/gerenciamento');
    }
  }else{
    console.log("Usuario Deslogado");
  }
});