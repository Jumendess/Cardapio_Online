$(document).ready(function (){
  cardapio.eventos.init();
})

var cardapio = {};

var MEU_CARRINHO= [];

cardapio.eventos = {

  init: () => {
    cardapio.metodos.obterItemsCadapio();
  }
}
cardapio.metodos = {
  // obtem a lista de itens do cardápio
  obterItemsCadapio: (categoria = 'burgers', vermais = false) => {

    var filtro = MENU[categoria];
    console.log(filtro);

    if(!vermais){

      $("#itensCardapio").html('')
      $("#btnVerMais").removeClass('hidden');
    }


    $.each(filtro, (i, e) => {
      let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
      .replace(/\${nome}/g, e.name)
      .replace(/\${preco}/g, e.price.toFixed(2)
      .replace('.', ',')).replace(/\${id}/g, e.id)

      // botão ver mais foi clicado 12 itens
      if(vermais && i >= 8 && i < 12){
        $("#itensCardapio").append(temp)
      }
      // paginação inicial com 8 itens
      if(!vermais && i < 8){
        $("#itensCardapio").append(temp)
      };
      })
      // remove o ativo
      $(".container-menu a").removeClass("active");
      // seta  menu que esta ativo
      $('#menu-' + categoria).addClass('active');
  },
  // clique no botão de ver mais.
  verMais: () =>{
    var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
    cardapio.metodos.obterItemsCadapio(ativo, true)

    $("#btnVerMais").addClass('hidden');
  },
  // Diminuir a Quantidade de itens no cardápio
  diminuirQuantidade: (id) =>{
    let qtndAtual = parseInt($("#qtnd-" + id).text());
    if(qtndAtual > 0){
      $("#qtnd-" + id).text(qtndAtual - 1)
    }
  },
  // Aumentar a quantidade de itens no cardápio
  aumentarQuantidade: (id) =>{
    let qtndAtual = parseInt($("#qtnd-" + id).text());
    $("#qtnd-" + id).text(qtndAtual + 1)

  },
  // Adicionar ao carrinho

  adicionarAoCarrinho: (id) =>{
    let qtndAtual = parseInt($("#qtnd-" + id).text());

    if(qtndAtual > 0){
      // obter a categoria ativa
      var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];
      // obter a lista de itens
      let filtro = MENU[categoria];
      // obter o item
      let item = $.grep(filtro, (e, i)=> {return e.id == id});

      if(item.length > 0){
        // validar se já existe esse item no carrinho
        let existe = $.grep(MEU_CARRINHO, (elem, index)=> {return elem.id == id});
        // se existir o produto no carrinho vai somente alterar a quantidade.
        if(existe.length > 0){
          let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
          MEU_CARRINHO[objIndex].qtnd= MEU_CARRINHO[objIndex].qtnd + qtndAtual;
        }
        // caso não exista o item no carinho ele vai adicioar
        else{
            item[0].qtnd= qtndAtual;
            MEU_CARRINHO.push(item[0])

        }

        cardapio.metodos.mensagem('Item adicionado no carrinho', 'green')
        $("#qtnd-" + id).text(0);

        cardapio.metodos.atualizaBagdeTotal();

      }

    }

  },
  // Atualiza o bagde de total de itens no carrinho
  atualizaBagdeTotal: () => {
    var total = 0;
    $.each(MEU_CARRINHO, (i, e)=> {
      total += e.qtnd
    })
    if(total > 0){
      $(".botao-carrinho").removeClass('hidden')
      $(".container-total-carrinho").removeClass('hidden')

    }
    else {
      $(".botao-carrinho").addClass('hidden')
      $(".container-total-carrinho").addClass('hidden')
    }
    $(".bagde-total-carrinho").html(total);
  },
  // Abrir carrinho
  abrirCarrinho: (abrir) => {
    if (abrir){
      $("#modal-carrinho").removeClass('hidden');
    }
    else {
      $("#modal-carrinho").addClass('hidden');
    }
  },

  // Mensagens

  mensagem: (texto, cor = 'red', tempo = 2500) => {
    let id = Math.floor(Date.now() * Math.random()).toString();


    let msg = `<div id="msg-${id}" class=" animated fadeInDown toast ${cor}">${texto}</div>`;
    $("#container-mensagens").append(msg);
    setTimeout(() =>{
      $("#msg-" + id).removeClass('fadeInDonw');
      $("#msg-" + id).addClass('fadeOutUp');
      setTimeout(() =>{
        $("#msg-" + id).remove();

      }, 800)

    }, tempo)
  },


}
cardapio.templates = {
    item: `
        <div class="col-3 mb-5">
                <div class="card card-item" id="\${id}">
                  <div class="img-produto">
                    <img
                      src="\${img}"
                      alt=""
                    />
                  </div>
                  <p class="title-produto text-center mt-4">
                    <b>\${nome}</b>
                  </p>
                  <p class="price-produto text-center">
                    <b>R$ \${preco}</b>
                  </p>
                  <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qtnd-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"
                      ><i class="fas fa-shopping-bag"></i
                    ></span>
                  </div>
                </div>
              </div>

      `
}
