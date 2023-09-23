$(document).ready(function () {
  cardapio.eventos.init();
});

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 5;

var CELULAR_EMPRESA = "5511998842630";

cardapio.eventos = {
  init: () => {
    cardapio.metodos.obterItemsCadapio();
    cardapio.metodos.carregarBotaoReserva();
    cardapio.metodos.carregarBotãoLigar();
  },
};
cardapio.metodos = {
  // obtem a lista de itens do cardápio
  obterItemsCadapio: (categoria = "burgers", vermais = false) => {
    var filtro = MENU[categoria];
    console.log(filtro);

    if (!vermais) {
      $("#itensCardapio").html("");
      $("#btnVerMais").removeClass("hidden");
    }

    $.each(filtro, (i, e) => {
      let temp = cardapio.templates.item
        .replace(/\${img}/g, e.img)
        .replace(/\${nome}/g, e.name)
        .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
        .replace(/\${id}/g, e.id);

      // botão ver mais foi clicado 12 itens
      if (vermais && i >= 8 && i < 12) {
        $("#itensCardapio").append(temp);
      }
      // paginação inicial com 8 itens
      if (!vermais && i < 8) {
        $("#itensCardapio").append(temp);
      }
    });
    // remove o ativo
    $(".container-menu a").removeClass("active");
    // seta  menu que esta ativo
    $("#menu-" + categoria).addClass("active");
  },
  // clique no botão de ver mais.
  verMais: () => {
    var ativo = $(".container-menu a.active").attr("id").split("menu-")[1];
    cardapio.metodos.obterItemsCadapio(ativo, true);

    $("#btnVerMais").addClass("hidden");
  },
  // Diminuir a Quantidade de itens no cardápio
  diminuirQuantidade: (id) => {
    let qtndAtual = parseInt($("#qtnd-" + id).text());
    if (qtndAtual > 0) {
      $("#qtnd-" + id).text(qtndAtual - 1);
    }
  },
  // Aumentar a quantidade de itens no cardápio
  aumentarQuantidade: (id) => {
    let qtndAtual = parseInt($("#qtnd-" + id).text());
    $("#qtnd-" + id).text(qtndAtual + 1);
  },
  // Adicionar ao carrinho

  adicionarAoCarrinho: (id) => {
    let qtndAtual = parseInt($("#qtnd-" + id).text());

    if (qtndAtual > 0) {
      // obter a categoria ativa
      var categoria = $(".container-menu a.active")
        .attr("id")
        .split("menu-")[1];
      // obter a lista de itens
      let filtro = MENU[categoria];
      // obter o item
      let item = $.grep(filtro, (e, i) => {
        return e.id == id;
      });

      if (item.length > 0) {
        // validar se já existe esse item no carrinho
        let existe = $.grep(MEU_CARRINHO, (elem, index) => {
          return elem.id == id;
        });
        // se existir o produto no carrinho vai somente alterar a quantidade.
        if (existe.length > 0) {
          let objIndex = MEU_CARRINHO.findIndex((obj) => obj.id == id);
          MEU_CARRINHO[objIndex].qtnd = MEU_CARRINHO[objIndex].qtnd + qtndAtual;
        }
        // caso não exista o item no carinho ele vai adicioar
        else {
          item[0].qtnd = qtndAtual;
          MEU_CARRINHO.push(item[0]);
        }

        cardapio.metodos.mensagem("Item adicionado no carrinho", "green");
        $("#qtnd-" + id).text(0);

        cardapio.metodos.atualizaBagdeTotal();
      }
    }
  },
  // Atualiza o bagde de total de itens no carrinho
  atualizaBagdeTotal: () => {
    var total = 0;
    $.each(MEU_CARRINHO, (i, e) => {
      total += e.qtnd;
    });
    if (total > 0) {
      $(".botao-carrinho").removeClass("hidden");
      $(".container-total-carrinho").removeClass("hidden");
    } else {
      $(".botao-carrinho").addClass("hidden");
      $(".container-total-carrinho").addClass("hidden");
    }
    $(".bagde-total-carrinho").html(total);
  },
  // Abrir carrinho
  abrirCarrinho: (abrir) => {
    if (abrir) {
      $("#modal-carrinho").removeClass("hidden");
      cardapio.metodos.carregarCarrinho();
    } else {
      $("#modal-carrinho").addClass("hidden");
    }
  },
  // altera os textos e exibe os botões das etaps
  carregarEtapa: (etapa) => {
    if (etapa == 1) {
      $("#ldlTituloEtapa").text("Seu Carrinho:");
      $("#items-carrinho").removeClass("hidden");
      $("#local-entrega").addClass("hidden");
      $("#resumo-carrinho").addClass("hidden");

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");

      $("#btnEtapaPedido").removeClass("hidden");
      $("#btnEtapaEndereco").addClass("hidden");
      $("#btnEtapaResumo").addClass("hidden");
      $("#btnVoltar").addClass("hidden");
    }
    if (etapa == 2) {
      $("#ldlTituloEtapa").text("Endereço de entrega:");
      $("#items-carrinho").addClass("hidden");
      $("#local-entrega").removeClass("hidden");
      $("#resumo-carrinho").addClass("hidden");

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");
      $(".etapa2").addClass("active");

      $("#btnEtapaPedido").addClass("hidden");
      $("#btnEtapaEndereco").removeClass("hidden");
      $("#btnEtapaResumo").addClass("hidden");
      $("#btnVoltar").removeClass("hidden");
    }
    if (etapa == 3) {
      $("#ldlTituloEtapa").text("Resumo do pedido:");
      $("#items-carrinho").addClass("hidden");
      $("#local-entrega").addClass("hidden");
      $("#resumo-carrinho").removeClass("hidden");

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");
      $(".etapa2").addClass("active");
      $(".etapa3").addClass("active");

      $("#btnEtapaPedido").addClass("hidden");
      $("#btnEtapaEndereco").addClass("hidden");
      $("#btnEtapaResumo").removeClass("hidden");
      $("#btnVoltar").removeClass("hidden");
    }
  },
  // botão de voltar etapa
  voltarEtapa: () => {
    let etapa = $(".etapa.active").length;
    cardapio.metodos.carregarEtapa(etapa - 1);
  },
  // carregar a lista de itens no carrinho
  carregarCarrinho: () => {
    cardapio.metodos.carregarEtapa(1);

    if (MEU_CARRINHO.length > 0) {
      $("#items-carrinho").html("");

      $.each(MEU_CARRINHO, (i, e) => {
        let temp = cardapio.templates.itemCarrinho
          .replace(/\${img}/g, e.img)
          .replace(/\${nome}/g, e.name)
          .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
          .replace(/\${id}/g, e.id)
          .replace(/\${qtnd}/g, e.qtnd);

        $("#items-carrinho").append(temp);
        // último item do carrinho
        if (i + 1 == MEU_CARRINHO.length) {
          cardapio.metodos.carregarValores();
        }
      });
    } else {
      $("#items-carrinho").html(
        '<p class="carrinho-vazio"><i class= "fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>'
      );
      cardapio.metodos.carregarValores();
    }
  },
  // diminuir quantidade de itens no carrinho
  diminuirQuantidadeCarrinho: (id) => {
    let qtndAtual = parseInt($("#qtnd-carrinho-" + id).text());
    if (qtndAtual > 0) {
      $("#qtnd-carrinho-" + id).text(qtndAtual - 1);
      cardapio.metodos.atualizarcarrinho(id, qtndAtual - 1);
    } else {
      cardapio.metodos.removerItemCarrinho(id);
    }
  },
  // Aumentar quantidade de itens no carrinho
  aumentarQuantidadeCarrinho: (id) => {
    let qtndAtual = parseInt($("#qtnd-carrinho-" + id).text());
    $("#qtnd-carrinho-" + id).text(qtndAtual + 1);
    cardapio.metodos.atualizarcarrinho(id, qtndAtual + 1);
  },
  // botão remover item do carrinho
  removerItemCarrinho: (id) => {
    MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => {
      return e.id != id;
    });
    cardapio.metodos.carregarCarrinho();
    cardapio.metodos.atualizaBagdeTotal();
  },
  // atualiza o carrinho com a quantidade atual
  atualizarcarrinho: (id, qtnd) => {
    let objIndex = MEU_CARRINHO.findIndex((obj) => obj.id == id);
    MEU_CARRINHO[objIndex].qtnd = qtnd;
    // aqui ele atualiza o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizaBagdeTotal();
    // atualiza os valores R$ totais do carrinho
    cardapio.metodos.carregarValores();
  },
  // carrega valores de subtotal, entrega e total.
  carregarValores: () => {
    VALOR_CARRINHO = 0;

    $("#lblSubTotal").text("R$ 0,00");
    $("#lblValorEntrega").text(+"R$ 0,00");
    $("#lblValorTotal").text("R$ 0,00");

    $.each(MEU_CARRINHO, (i, e) => {
      VALOR_CARRINHO += parseFloat(e.price * e.qtnd);

      if (i + 1 == MEU_CARRINHO.length) {
        $("#lblSubTotal").text(
          `R$ ${VALOR_CARRINHO.toFixed(2).replace(".", ",")}`
        );
        $("#lblValorEntrega").text(
          `+ R$ ${VALOR_ENTREGA.toFixed(2).replace(".", ",")}`
        );
        $("#lblValorTotal").text(
          `R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace(".", ",")}`
        );
      }
    });
  },
  // carregar etapa de endereço
  carregarEndereco: () => {
    if (MEU_CARRINHO.length <= 0) {
      cardapio.metodos.mensagem("Seu carrinho esta vazio");
      return;
    }
    cardapio.metodos.carregarEtapa(2);
  },

  // buscar cep na api ViaCep
  buscarCEP: () => {
    // cria a variavel com o valor do cep
    var cep = $("#txtCEP").val().trim().replace(/\D/g, " ");
    // aqui verifica se o cep possui valor informado
    if (cep != "") {
      //expressão regular para validar cep
      var validacep = /^[0-9]{8}$/;

      if (validacep.test(cep)) {
        $.getJSON(
          "https://viacep.com.br/ws/" + cep + "/json/?callback=?",
          function (dados) {
            if (!("erro" in dados)) {
              // atualizar os campo com os valores retornados
              $("#txtEndereco").val(dados.logradouro);
              $("#txtBairro").val(dados.bairro);
              $("#txtCidade").val(dados.localidade);
              $("#ddlUf").val(dados.uf);
              $("#txtNumero").focus();
            } else {
              cardapio.metodos.mensagem(
                "CEP não encontrado. Preencha as informações manualmente"
              );
              $("#txtEndereco").focus();
            }
          }
        );
      } else {
        cardapio.metodos.mensagem("Formato do cep inválido.");
        $("#txtCEP").focus();
      }
    } else {
      cardapio.metodos.mensagem("Informe o CEP por favor.");
      $("#txtCEP").focus();
    }
  },
  // Validação antes de prosseguir para a etapa 3
  resumoPedido: () => {
    let cep = $("#txtCEP").val().trim();
    let endereco = $("#txtEndereco").val().trim();
    let bairro = $("#txtBairro").val().trim();
    let cidade = $("#txtCidade").val().trim();
    let uf = $("#ddlUf").val().trim();
    let numero = $("#txtNumero").val().trim();
    let complemento = $("#txtComplemento").val().trim();

    if (cep.length <= 0) {
      cardapio.metodos.mensagem("informe o CEP por favor");
      $("#txtCEP").focus();
      return;
    }
    if (endereco.length <= 0) {
      cardapio.metodos.mensagem("informe o endereço por favor");
      $("#txtEndereco").focus();
      return;
    }
    if (bairro.length <= 0) {
      cardapio.metodos.mensagem("informe o bairro por favor");
      $("#txtBairro").focus();
      return;
    }
    if (cidade.length <= 0) {
      cardapio.metodos.mensagem("informe a Cidade por favor");
      $("#txtCidade").focus();
      return;
    }
    if (uf == "-1") {
      cardapio.metodos.mensagem("informe a UF por favor");
      $("#ddlUf").focus();
      return;
    }
    if (numero.length <= 0) {
      cardapio.metodos.mensagem("informe o número por favor");
      $("#txtNumero").focus();
      return;
    }
    MEU_ENDERECO = {
      cep: cep,
      endereco: endereco,
      bairro: bairro,
      cidade: cidade,
      uf: uf,
      numero: numero,
      complemento: complemento,
    };
    cardapio.metodos.carregarEtapa(3);
    cardapio.metodos.carregarResumo();
  },
  // carrega a etapa de resumo do pedido
  carregarResumo: () => {
    $("#listaItemsResumo").html("");

    $.each(MEU_CARRINHO, (i, e) => {
      let temp = cardapio.templates.itemResumo
        .replace(/\${img}/g, e.img)
        .replace(/\${nome}/g, e.name)
        .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
        .replace(/\${qtnd}/g, e.qtnd);

      $("#listaItemsResumo").append(temp);
    });
    $("#resumoEnedereco").html(
      `${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`
    );
    $("#cidadeEndereco").html(
      `${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`
    );
    cardapio.metodos.finalizarPedido();
  },
  // Atualiza o link do botão do whatsApp
  finalizarPedido: () => {
    if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {
      var texto = `Olá gostaria de fazer um pedido:`;
      texto += `\n*itens do pedido:*\n\n\${itens}`;
      texto += `\n*Endereço de entrega* \n`;
      texto += `${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
      texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
      texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA)
        .toFixed(2)
        .replace(".", ",")} *`;

      var itens = "";

      $.each(MEU_CARRINHO, (i, e) => {
        itens += `*${e.qtnd}x* ${e.name} .......R$ ${e.price
          .toFixed(2)
          .replace(".", ",")} cada\n`;

        if (i + 1 == MEU_CARRINHO.length) {
          texto = texto.replace(/\${itens}/g, itens);
          // converter a URL
          let encode = encodeURI(texto);
          let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

          $("#btnEtapaResumo").attr("href", URL);
        }
      });
    }
  },

  // carrega o link do botão de reserva
  carregarBotaoReserva: () => {
    var texto = "Olá! Gostaria de fazer uma *reserva*";
    var encode = encodeURI(texto);
    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

    $("#btnReserva").attr("href", URL);
  },
  // carrega o botão de ligar
  carregarBotãoLigar: () => {
    $("#btnLigar").attr("href", `tel:${CELULAR_EMPRESA}`);
  },
  // troca de depoimentos
  abrirDepoimento: (depoimento) => {
    $("#depoimento-1").addClass("hidden");
    $("#depoimento-2").addClass("hidden");
    $("#depoimento-3").addClass("hidden");

    $("#btnDepoimento-1").removeClass("active");
    $("#btnDepoimento-2").removeClass("active");
    $("#btnDepoimento-3").removeClass("active");

    $("#depoimento-" + depoimento).removeClass("hidden");
    $("#btnDepoimento-" + depoimento).addClass("active");
  },

  // Mensagens
  mensagem: (texto, cor = "red", tempo = 2500) => {
    let id = Math.floor(Date.now() * Math.random()).toString();

    let msg = `<div id="msg-${id}" class=" animated fadeInDown toast ${cor}">${texto}</div>`;
    $("#container-mensagens").append(msg);
    setTimeout(() => {
      $("#msg-" + id).removeClass("fadeInDonw");
      $("#msg-" + id).addClass("fadeOutUp");
      setTimeout(() => {
        $("#msg-" + id).remove();
      }, 800);
    }, tempo);
  },
};
cardapio.templates = {
  item: `
        <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5">
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

      `,

  itemCarrinho: `
      <div class="col-12 item-carrinho">
      <div class="img-produto">
        <img
          src="\${img}"
          alt=""
        />
      </div>
      <div class="dados-produto">
        <p class="title-produto"></p>
        <b>\${nome}</b>
        <p class="price-produto"></p>
        <b>R$ \${preco}</b>
      </div>
      <div class="add-carrinho">
      <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
      <span class="add-numero-itens" id="qtnd-carrinho-\${id}">\${qtnd}</span>
      <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
        <span class="btn btn-remove" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fas fa-times"></i></span>
      </div>
    </div>
      `,
  itemResumo: `
        <div class="col-12 item-carrinho resumo">
        <div class="img-produto-resumo">
          <img
            src="\${img}"
            alt=""
          />
        </div>
        <div class="dados-produto">
          <p class="title-produto-resumo">
            <b>\${nome}</b>
          </p>
          <p class="price-produto-resumo">
            <b>R$ \${preco}</b>
          </p>
        </div>
        <p class="quantidade-produto-resumo">x <b>\${qtnd}</b></p>
      </div>
  `,
};
