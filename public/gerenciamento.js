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

var atualizarNoticiaID = "";
var hasPopUp = false;

var signOutBtn = document.getElementById("signOutBtn");
var tabela = document.getElementById("noticiasTable");

signOutBtn.addEventListener('click', e=>{
  firebase.auth().signOut();
});

firebase.auth().onAuthStateChanged(user =>{
  if(user){
    if(window.location.href != 'https://casperbot-elifetraining.glitch.me/gerenciamento'){
      window.location.replace('https://casperbot-elifetraining.glitch.me/gerenciamento');
    }
  }else{
    console.log("Usuario Deslogado");
    if(window.location.href != 'https://casperbot-elifetraining.glitch.me'){
      window.location.replace('https://casperbot-elifetraining.glitch.me');
    }
  }
});

function updateTable(){
  
  let database = firebase.database();
  
  const ref = database.ref('noticias');

  ref.on('value', (snapshot) => {
    let noticias = [];

    snapshot.forEach(function(item) {
        var itemVal = item.val();
      itemVal.noticiaID = item.key;
        noticias.push(itemVal);
    });
    
    noticias.forEach(function(noticia){
      let linhaNoticia = document.createElement("tr");
      
      let colunaTitulo = document.createElement("td");
      let colunaDescricao = document.createElement("td");
      let colunaTema = document.createElement("td");
      let colunaLinkNoticia = document.createElement("td");
      let colunaLinkImagem = document.createElement("td");
      let botoesDiv = document.createElement("div");
      let botaoAtualizar = document.createElement("button");
      let botaoDeletar = document.createElement("button");
      
      colunaTitulo.innerHTML = noticia.titulo;
      colunaDescricao.innerHTML = noticia.descricao;
      colunaTema.innerHTML = noticia.tema;
      colunaLinkNoticia.innerHTML = noticia.link;
      colunaLinkImagem.innerHTML = noticia.imagemURL;
      
      botoesDiv.style.width = "100%";
      
      botaoAtualizar.innerHTML = "Atualizar";
      botaoDeletar.innerHTML = "Deletar";
      
      botaoAtualizar.style.width = "100%";
      botaoDeletar.style.width = "100%";
      
      botaoAtualizar.style.backgroundColor = "#abeaf5";
      botaoDeletar.style.backgroundColor = "#f58e87";
      
      botaoAtualizar.dataset.noticia_id = noticia.noticiaID;
      botaoDeletar.dataset.noticia_id = noticia.noticiaID;
      
      botaoAtualizar.addEventListener('click', atualizarNoticia.bind(event));
      botaoDeletar.addEventListener('click', deletarNoticia.bind(event));
      
      botoesDiv.appendChild(botaoAtualizar);
      botoesDiv.appendChild(botaoDeletar);
      
      linhaNoticia.appendChild(colunaTitulo);
      linhaNoticia.appendChild(colunaDescricao);
      linhaNoticia.appendChild(colunaTema);
      linhaNoticia.appendChild(colunaLinkNoticia);
      linhaNoticia.appendChild(colunaLinkImagem);
      linhaNoticia.appendChild(botoesDiv);
      
      tabela.appendChild(linhaNoticia);
    });
  },(errorObject) => {
    console.log('The read failed: ' + errorObject.name);
  });
}

function atualizarNoticia(event){
  if(hasPopUp){
    return;
  }
  
  console.log(event.srcElement.dataset.noticia_id);
  atualizarNoticiaID = event.srcElement.dataset.noticia_id;
  
  const dbRef = firebase.database().ref();
  dbRef.child("noticias").child(atualizarNoticiaID).get().then((snapshot) => {
    if (snapshot.exists()) {
      let noticia = snapshot.val();
      console.log(noticia);
      
      document.getElementById("inputTituloNoticia").value = noticia.titulo;
      document.getElementById("inputDescricaoNoticia").value = noticia.descricao;
      document.getElementById("inputLinkNoticia").value = noticia.link;
      document.getElementById("inputLinkImgNoticia").value = noticia.imagemURL;

      let tipoNoticiaSelect = document.getElementById("inputTipoNoticia");
      
      let opts = tipoNoticiaSelect.options;
      for (var opt, j = 0; opt = opts[j]; j++) {
        console.log(opt.value, noticia.tema)
        if (opt.value == noticia.tema) {
          tipoNoticiaSelect.selectedIndex = j;
          break;
        }
      }
      document.getElementById("textoAtualizarNoticia").innerHTML = "Atualizar Noticia";
      document.getElementById("btnAtualizarNoticia").innerHTML = "Atualizar";
      document.getElementById("btnAtualizarNoticia").setAttribute('onclick','confirmarAtualizarNoticia()');
      
      document.getElementById("divAtualizarNoticia").hidden = false;
      hasPopUp = true;
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
}

function confirmarAtualizarNoticia(){
  
  let titulo = document.getElementById("inputTituloNoticia").value;
  let descricao = document.getElementById("inputDescricaoNoticia").value;
  let link = document.getElementById("inputLinkNoticia").value;
  let linkImagem = document.getElementById("inputLinkImgNoticia").value;
  let tema = document.getElementById("inputTipoNoticia").value;
  console.log("tipo::::", tema);
  
  var postData = {
    titulo: titulo,
    descricao: descricao,
    tema: tema,
    link: link,
    imagemURL: linkImagem
  };

  var updates = {};
  updates['/noticias/' + atualizarNoticiaID] = postData;

  firebase.database().ref().update(updates);
  document.getElementById("divAtualizarNoticia").hidden = true;
  hasPopUp = false;
  location.reload();
}

function deletarNoticia(event){
  if(hasPopUp){
    return;
  }
  atualizarNoticiaID = event.srcElement.dataset.noticia_id
  document.getElementById("divDeletarNoticia").hidden = false;
  hasPopUp = true;
}

function confirmarDeletarNoticia(){
  let ref = firebase.database().ref('noticias/' + atualizarNoticiaID);
  ref.remove();
  document.getElementById("divDeletarNoticia").hidden = true;
  location.reload();
}

function criarNoticia(){
  if(hasPopUp){
    return;
  }
  
  document.getElementById("inputTituloNoticia").value = "";
  document.getElementById("inputDescricaoNoticia").value = "";
  document.getElementById("inputLinkNoticia").value = "";
  document.getElementById("inputLinkImgNoticia").value = "";
  document.getElementById("inputTipoNoticia").selectedIndex = 0;
  
  document.getElementById("textoAtualizarNoticia").innerHTML = "Criar Noticia";
  document.getElementById("btnAtualizarNoticia").innerHTML = "Criar";
  document.getElementById("btnAtualizarNoticia").setAttribute('onclick','confirmarCriarNoticia()');
  
  document.getElementById("divAtualizarNoticia").hidden = false;
  hasPopUp = true;
}

function confirmarCriarNoticia(){
  let titulo = document.getElementById("inputTituloNoticia").value;
  let descricao = document.getElementById("inputDescricaoNoticia").value;
  let link = document.getElementById("inputLinkNoticia").value;
  let linkImagem = document.getElementById("inputLinkImgNoticia").value;
  let tema = document.getElementById("inputTipoNoticia").value;
  
  var postData = {
    titulo: titulo,
    descricao: descricao,
    tema: tema,
    link: link,
    imagemURL: linkImagem
  };

  let newKey = firebase.database().ref().child('noticias').push().key;
  console.log("key ", newKey);
  firebase.database().ref('noticias/'+newKey).set({
    imagemURL: linkImagem,
    titulo: titulo,
    descricao: descricao,
    tema: tema,
    link: link
  }).catch(e=>{
    console.log(e); 
  }).then(o=>{
    console.log(o);
  });
  document.getElementById("divAtualizarNoticia").hidden = true;
  hasPopUp = false;
  location.reload();
}

function cancelarAcao(){
  document.getElementById("divAtualizarNoticia").hidden = true;
  document.getElementById("divDeletarNoticia").hidden = true;
  atualizarNoticiaID = "";
  hasPopUp = false;
}

updateTable();