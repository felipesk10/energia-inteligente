
// Lista de aparelhos
let aparelhos = [];

// Recupera os aparelhos salvos no navegador
let aparelhosSalvos = localStorage.getItem("aparelhos");

if (aparelhosSalvos != null) {
    try {
        aparelhos = JSON.parse(aparelhosSalvos);

        if (!Array.isArray(aparelhos)) {
            aparelhos = [];
        }
    } catch (erro) {
        aparelhos = [];
    }
}

// Calcula o consumo usando potência em W ou kW
function calcularConsumo(potencia, horas, dias, unidade) {
    if (unidade == "kW") {
        return potencia * horas * dias;
    }

    return (potencia * horas * dias) / 1000;
}

// Formata números com vírgula
function formatarNumero(valor) {
    return valor.toFixed(2).replace(".", ",");
}

// Salva os aparelhos no navegador
function salvarAparelhos() {
    localStorage.setItem("aparelhos", JSON.stringify(aparelhos));
}

// Alterna os campos do formulário
function atualizarCampos() {
    let tipo = document.getElementById("tipoConsumo").value;

    let camposPotencia = document.getElementById("camposPotencia");
    let camposMensal = document.getElementById("camposMensal");
    let labelPotencia = document.getElementById("labelPotencia");
    let campoPotencia = document.getElementById("potencia");

    if (tipo == "mensal") {
        camposPotencia.hidden = true;
        camposMensal.hidden = false;
    } else {
        camposPotencia.hidden = false;
        camposMensal.hidden = true;

        labelPotencia.textContent =
            "Potência do aparelho (" + tipo + "):";

        if (tipo == "kW") {
            campoPotencia.placeholder = "Ex: 7,8";
        } else {
            campoPotencia.placeholder = "Ex: 7800";
        }
    }
}

// Calcula o consumo de cada aparelho
function obterConsumo(aparelho) {
    // Consumo mensal conhecido
    if (aparelho.tipo == "mensal") {
        return Number(aparelho.consumoMensal);
    }

    // Aparelhos antigos eram cadastrados em watts
    let unidade = aparelho.tipo == "kW" ? "kW" : "W";

    return calcularConsumo(
        Number(aparelho.potencia),
        Number(aparelho.horas),
        Number(aparelho.dias),
        unidade
    );
}

// Mostra a lista e atualiza o resumo
function mostrarAparelhos() {
    let lista = document.getElementById("listaAparelhos");

    let campoTarifa = document.getElementById("valorKwh");
    let tarifaValida = campoTarifa.value.trim() != "" &&
                       Number(campoTarifa.value) > 0;

    let valorKwh = Number(campoTarifa.value);

    let consumoTotal = 0;

    lista.innerHTML = "";

    if (aparelhos.length == 0) {
        lista.innerHTML = "<p>Nenhum aparelho cadastrado.</p>";
    }

    for (let i = 0; i < aparelhos.length; i++) {
        let aparelho = aparelhos[i];

        let consumo = obterConsumo(aparelho);

        consumoTotal += consumo;

        let item = document.createElement("div");
        item.className = "aparelho-item";

        let texto = document.createElement("p");

        let descricao = aparelho.nome + " - " +
            formatarNumero(consumo) + " kWh/mês";

        if (tarifaValida) {
            let custo = consumo * valorKwh;

            descricao += " - R$ " + formatarNumero(custo);
        } else {
            descricao += " - Informe a tarifa";
        }

        texto.textContent = descricao;

        let botaoExcluir = document.createElement("button");
        botaoExcluir.textContent = "Excluir";

        botaoExcluir.onclick = function() {
            aparelhos.splice(i, 1);
            salvarAparelhos();
            mostrarAparelhos();
        };

        item.appendChild(texto);
        item.appendChild(botaoExcluir);

        lista.appendChild(item);
    }

    // Atualiza o consumo total
    document.getElementById("consumoTotal").textContent =
        formatarNumero(consumoTotal);

    // Atualiza o custo total
    if (tarifaValida) {
        let custoTotal = consumoTotal * valorKwh;

        document.getElementById("custoTotal").textContent =
            formatarNumero(custoTotal);
    } else {
        document.getElementById("custoTotal").textContent =
            "—";
    }
}

// Cadastrar aparelho
document.getElementById("btnAdicionar").onclick = function() {
    let campoTarifa = document.getElementById("valorKwh");
    let valorKwh = Number(campoTarifa.value);

    // Verifica o valor da energia
    if (campoTarifa.value.trim() == "" ||
        !Number.isFinite(valorKwh) || valorKwh <= 0) {
        alert("Informe um valor válido para o kWh!");
        campoTarifa.focus();
        return;
    }

    let nome = document.getElementById("nomeAparelho").value.trim();
    let tipo = document.getElementById("tipoConsumo").value;

    if (nome == "") {
        alert("Informe o nome do aparelho!");
        document.getElementById("nomeAparelho").focus();
        return;
    }

    let aparelho = {
        nome: nome,
        tipo: tipo
    };

    if (tipo == "mensal") {
        // Cadastro pelo consumo da etiqueta
        let campoMensal = document.getElementById("consumoMensal");
        let consumoMensal = Number(campoMensal.value);

        if (campoMensal.value.trim() == "" ||
            !Number.isFinite(consumoMensal) ||
            consumoMensal <= 0) {
            alert("Informe um consumo mensal válido!");
            campoMensal.focus();
            return;
        }

        aparelho.consumoMensal = consumoMensal;

    } else {
        // Cadastro pela potência em W ou kW
        let campoPotencia = document.getElementById("potencia");
        let campoHoras = document.getElementById("horas");
        let campoDias = document.getElementById("dias");

        let potencia = Number(campoPotencia.value);
        let horas = Number(campoHoras.value);
        let dias = Number(campoDias.value);

        if (campoPotencia.value.trim() == "" ||
            !Number.isFinite(potencia) || potencia <= 0) {
            alert("Informe uma potência válida!");
            campoPotencia.focus();
            return;
        }

        if (campoHoras.value.trim() == "" ||
            !Number.isFinite(horas) ||
            horas <= 0 || horas > 24) {
            alert("Informe as horas de uso entre 0 e 24!");
            campoHoras.focus();
            return;
        }

        if (campoDias.value.trim() == "" ||
            !Number.isInteger(dias) ||
            dias < 1 || dias > 31) {
            alert("Informe os dias de uso entre 1 e 31!");
            campoDias.focus();
            return;
        }

        aparelho.potencia = potencia;
        aparelho.horas = horas;
        aparelho.dias = dias;
    }

    // Adiciona e salva
    aparelhos.push(aparelho);

    salvarAparelhos();
    mostrarAparelhos();

    // Limpa os campos do aparelho
    document.getElementById("nomeAparelho").value = "";
    document.getElementById("potencia").value = "";
    document.getElementById("horas").value = "";
    document.getElementById("dias").value = "";
    document.getElementById("consumoMensal").value = "";
};

// Troca entre W, kW e consumo mensal
document.getElementById("tipoConsumo").onchange = atualizarCampos;

// Salva a tarifa e atualiza os cálculos
document.getElementById("valorKwh").oninput = function() {
    localStorage.setItem("valorKwh", this.value);
    mostrarAparelhos();
};

// Recupera a tarifa salva
let tarifaSalva = localStorage.getItem("valorKwh");

if (tarifaSalva != null) {
    document.getElementById("valorKwh").value = tarifaSalva;
}

// Inicia o sistema
atualizarCampos();
mostrarAparelhos();
