const express = require("express");
const app = express();

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
 
// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
 
// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.send("OK Express");
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
      let tipoNoticia = request.body.queryResult.parameters.tipo_noticia;
      response.json({"fulfillmentText": "Você Escolheu: " + tipoNoticia});
      break;
  }
  
  //response.json({"fulfillmentText": "Intent Name: " + intentName});
});
 
 
// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});