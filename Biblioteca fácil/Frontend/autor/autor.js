const URL_API = 'http://localhost:3001';

let oQueEstaFazendo = '';
let autor = null;
bloquearAtributos(true);

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/autor/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data.autor : null;
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const id_autor = parseInt(document.getElementById("inputId_autor").value, 10);
    if (isNaN(id_autor)) {
        mostrarAviso("O ID do autor não pode ser vazio e deve ser um número.");
        return;
    }

    autor = await procurePorChavePrimaria(id_autor);
    oQueEstaFazendo = '';
    
    if (autor) {
        mostrarDadosautor(autor);
        visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none');
        mostrarAviso("Achou no banco, pode alterar ou excluir");
    } else {
        limparAtributos();
        visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none');
        mostrarAviso("Não achou no banco, pode inserir");
    }
}

function inserir() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'inserindo';
    mostrarAviso("INSERINDO - Digite o nome do autor e clique em salvar");
}

function alterar() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Digite o novo nome e clique em salvar");
}

function excluir() {
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - Clique em salvar para confirmar a exclusão");
}

async function salvar() {
    const id_autor = parseInt(document.getElementById("inputId_autor").value, 10);
    const nome_autor = document.getElementById("inputNome_autor").value.trim();

    if (isNaN(id_autor)) {
        mostrarAviso("O ID do autor deve ser um número válido.");
        return;
    }

    const dadosautor = { id_autor, nome_autor };

    try {
        if (oQueEstaFazendo === 'inserindo') {
            const resp = await fetch(`${URL_API}/autor`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(dadosautor) 
            });
            const data = await resp.json();
            if (!data.sucesso) return mostrarAviso(data.mensagem);
            mostrarAviso("Inserido no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'alterando') {
            const resp = await fetch(`${URL_API}/autor/${id_autor}`, { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(dadosautor) 
            });
            const data = await resp.json();
            if (!data.sucesso) return mostrarAviso(data.mensagem);
            mostrarAviso("Alterado no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'excluindo') {
            const resposta = await fetch(`${URL_API}/autor/${id_autor}`, { method: 'DELETE' });
            const data = await resposta.json();
            if (!data.sucesso) {
                mostrarAviso(data.mensagem || "Erro ao excluir no servidor.");
                return;
            }
            mostrarAviso("Excluído do Banco de Dados!");
        }

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputId_autor").value = "";
        listar();
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operação no servidor.");
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/autor/listar`);

       
        const data = await resposta.json();
       // alert("teste "+stringify(dada))
        if (data.sucesso) {
            let texto = "";
            for (let linha of data.autores) {
                texto += `<b>[${linha.id_autor}]</b> - ${linha.nome_autor}<br>`;
            }
            document.getElementById("outputSaida").innerHTML = texto || "Nenhum autor cadastrado.";
        } else {
            document.getElementById("outputSaida").innerHTML = `Erro no banco: ${data.mensagem}`;
        }
    } catch (erro) {
        console.error("Erro ao listar:", erro);
        document.getElementById("outputSaida").innerHTML = "Servidor offline ou erro de conexão (CORS).";
    }
}

function cancelarOperacao() {
    limparAtributos();
    bloquearAtributos(true);
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
    mostrarAviso("Cancelou a operação");
}

function mostrarAviso(mensagem) {
    document.getElementById("divAviso").innerHTML = mensagem;
}

function mostrarDadosautor(u) {
    document.getElementById("inputId_autor").value = u.id_autor;
    document.getElementById("inputNome_autor").value = u.nome_autor;
    bloquearAtributos(true);
}

function limparAtributos() {
    autor = null;
    oQueEstaFazendo = '';
    document.getElementById("inputNome_autor").value = "";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputId_autor").readOnly = !soLeitura;
    document.getElementById("inputNome_autor").readOnly = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}