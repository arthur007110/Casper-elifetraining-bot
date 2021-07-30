const express = require("express");
const app = express();
const path = require('path');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var crypto = require("crypto");

var admin = require("firebase");

var serviceAccount = {
  "type": process.env.firebase_type,
  "project_id": process.env.firebase_project_id,
  "private_key_id": process.env.firebase_private_key_id,
  "private_key": process.env.firebase_private_key,
  "client_email": process.env.firebase_client_email,
  "client_id": process.env.firebase_client_id,
  "auth_uri": process.env.firebase_auth_uri,
  "token_uri": process.env.firebase_token_uri,
  "auth_provider_x509_cert_url": process.env.firebase_auth_provider_x509_cert_url,
  "client_x509_cert_url": process.env.firebase_client_x509_cert_url,
  "databaseURL": process.env.firebase_databaseURL
}

admin.initializeApp(serviceAccount); 

var database = admin.database();
 
// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
 
// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "src/pages/index.html"));
});

app.get("/gerenciamento", (request, response) => {
  response.sendFile(path.join(__dirname, "src/pages/gerenciamento.html"));
});

app.post("/webhook", (request, response) => {
  let date = new Date();
  let hour = date.getDate();
  
  let intentName = request.body.queryResult.intent.displayName;
  
  switch(intentName){
    case "Default Welcome Intent":
      //TODO
      response.json({"fulfillmentMessages": [
        {
          "text": {
            "text": [
              "Olá, me chamo Casper e vou te ajudar a se manter atualizado com noticias do cotidiano"
            ]
          }
        },
        {
          "quickReplies": {
            "title": "Escolha o Tema de Noticia que Deseja",
            "quickReplies": [
              "Esportes",
              "Politica",
              "Entretenimento",
              "Famosos"
            ]
          }
        }
      ]});
      break;
    case "escolher.tema":
      //TODO
      let tipoNoticia = request.body.queryResult.parameters['tipo-noticia'];
      //response.json({"fulfillmentText": "Você Escolheu: " + tipoNoticia});
      
      let ref = admin.database().ref("noticias");
      let query = ref.orderByChild("tema").equalTo(tipoNoticia).limitToFirst(10);

      query.once('value',function(snap) {
        let noticias = [];
        
        snap.forEach(function(item) {
            var itemVal = item.val();
            noticias.push(itemVal);
        });
        
        let noticiasGenericModels = [];
        
        noticias.forEach(function(noticia){
          let noticiasGenericModel = {
            "title":noticia.titulo,
            "image_url":noticia.imagemURL,
            "subtitle":noticia.descricao,
            "buttons":[
              {
                "type":"web_url",
                "url":noticia.link,
                "title":"Ir para a noticia"
              }             
            ]      
          }
          
          noticiasGenericModels.push(noticiasGenericModel);
        });
        if(noticiasGenericModels.length > 0){
          response.json({"fulfillmentMessages": [
            {
              "text": {
                "text": [
                  "Exibindo Noticias Sobre: " + tipoNoticia
                ]
              }
            },
            {
              "payload":{
                "facebook": {
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type":"generic",
                      "elements": noticiasGenericModels
                      }
                    }
                  }
                }
              }
            ]});
        }else{
          response.json(
            {
              "fulfillmentMessages": [
                {
                  "text": {
                    "text": [
                      "Desculpe, não há noticias sobre " + tipoNoticia + " no momento"
                    ]
                  }
                },
                {
                  "text": {
                    "text": [
                      "Por favor escolha outro tema"
                    ]
                  }
                },
                {
                  "quickReplies": {
                    "title": "Escolha o Tema de Noticia que Deseja",
                    "quickReplies": [
                      "Esportes",
                      "Politica",
                      "Entretenimento",
                      "Famosos"
                    ]
                  }
                }
              ],
              "outputContexts": [
                {
                  "name": "projects/treinamento-chatbot-elife-vngc/agent/sessions/2c6097b3-3312-a170-7423-2c10803e9fff/contexts/escolhadetema",
                  "lifespanCount": 1
                }
              ]
            }
          );
        }
      });
      break;
  }
});
 
 
// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

//Database Functions
function criarNoticia(imagemURL, titulo, descricao, tema, link) {
  let newKey = admin.database().ref().child('noticias').push().key;
  admin.database().ref('noticias/'+newKey).set({
    imagemURL: imagemURL,
    titulo: titulo,
    descricao: descricao,
    tema: tema,
    link: link
  }).catch(e=>{
    console.log(e); 
  }).then(o=>{
    console.log(o);
  });
}
function popularNoticias(){
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Entretenimento", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Politica", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Politica", "https://www.google.com/");
  criarNoticia("https://www.anselmohoffmann.com.br/wp-content/uploads/2021/05/Por-do-sol-na-fotografia-de-paisagem-7.jpg", "Titulo da Noticia", "Descrição da Noticia", "Politica", "https://www.google.com/");
}
//popularNoticias()