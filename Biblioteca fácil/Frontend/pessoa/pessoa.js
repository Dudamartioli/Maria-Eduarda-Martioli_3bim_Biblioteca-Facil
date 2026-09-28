const API_BASE_URL = 'http://localhost:3001';

let currentPersonId = null;
let operacao = null;


// ======================================================
// ELEMENTOS DO HTML
// ======================================================

const form = document.getElementById('pessoaForm');
const searchId = document.getElementById('searchId');

const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');

const pessoasTableBody =
    document.getElementById('pessoasTableBody');

const messageContainer =
    document.getElementById('messageContainer');


// ======================================================
// QUANDO A PÁGINA CARREGAR
// ======================================================

document.addEventListener('DOMContentLoaded', () => {

    carregarPessoas();

    // Carrega os cargos que estão no banco de dados
    popularCargosSelect();
});


// ======================================================
// EVENTOS DOS BOTÕES
// ======================================================

btnBuscar.addEventListener('click', buscarPessoa);
btnIncluir.addEventListener('click', incluirPessoa);
btnAlterar.addEventListener('click', alterarPessoa);
btnExcluir.addEventListener('click', excluirPessoa);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);


// ======================================================
// ESTADO INICIAL
// ======================================================

mostrarBotoes(
    true,
    false,
    false,
    false,
    false,
    false
);

bloquearCampos(false);


// ======================================================
// MOSTRAR MENSAGEM
// ======================================================

function mostrarMensagem(texto, tipo = 'info') {

    messageContainer.innerHTML =
        `<div class="message ${tipo}">${texto}</div>`;

    setTimeout(() => {

        messageContainer.innerHTML = '';

    }, 3000);
}


// ======================================================
// BLOQUEAR CAMPOS
// ======================================================

function bloquearCampos(bloquearPrimeiro) {

    const inputs =
        document.querySelectorAll(
            '#pessoaForm input, #pessoaForm select'
        );

    inputs.forEach((input, index) => {

        if (index === 0) {

            input.disabled =
                bloquearPrimeiro;

        } else {

            input.disabled =
                !bloquearPrimeiro;
        }
    });


    // ==================================================
    // CAMPOS DE FUNCIONÁRIO
    // ==================================================

    document.getElementById(
        'checkboxFuncionario'
    ).disabled =
        !bloquearPrimeiro;

    document.getElementById(
        'cargo_id_cargo'
    ).disabled =
        !bloquearPrimeiro;

    document.getElementById(
        'salario_funcionario'
    ).disabled =
        !bloquearPrimeiro;

    document.getElementById(
        'data_admissao_funcionario'
    ).disabled =
        !bloquearPrimeiro;


    // ==================================================
    // CAMPOS DE CLIENTE
    // ==================================================

    document.getElementById(
        'checkboxCliente'
    ).disabled =
        !bloquearPrimeiro;

    document.getElementById(
        'data_cadastro_cliente'
    ).disabled =
        !bloquearPrimeiro;
}


// ======================================================
// LIMPAR FORMULÁRIO
// ======================================================

function limparFormulario() {

    form.reset();


    // Funcionário

    document.getElementById(
        'checkboxFuncionario'
    ).checked = false;

    document.getElementById(
        'cargo_id_cargo'
    ).value = '';

    document.getElementById(
        'salario_funcionario'
    ).value = '';

    document.getElementById(
        'data_admissao_funcionario'
    ).value = '';


    // Cliente

    document.getElementById(
        'checkboxCliente'
    ).checked = false;

    document.getElementById(
        'data_cadastro_cliente'
    ).value = '';
}


// ======================================================
// MOSTRAR BOTÕES
// ======================================================

function mostrarBotoes(
    btBuscar,
    btIncluir,
    btAlterar,
    btExcluir,
    btSalvar,
    btCancelar
) {

    btnBuscar.style.display =
        btBuscar ? 'inline-block' : 'none';

    btnIncluir.style.display =
        btIncluir ? 'inline-block' : 'none';

    btnAlterar.style.display =
        btAlterar ? 'inline-block' : 'none';

    btnExcluir.style.display =
        btExcluir ? 'inline-block' : 'none';

    btnSalvar.style.display =
        btSalvar ? 'inline-block' : 'none';

    btnCancelar.style.display =
        btCancelar ? 'inline-block' : 'none';
}


// ======================================================
// FORMATAR DATA
// ======================================================

function formatarData(dataString) {

    if (!dataString) {

        return '';
    }

    const data =
        new Date(dataString);

    return data.toLocaleDateString('pt-BR');
}


// ======================================================
// CONVERTER DATA PARA ISO
// ======================================================

function converterDataParaISO(dataString) {

    if (!dataString) {

        return null;
    }

    return new Date(dataString).toISOString();
}


// ======================================================
// CONVERTER DATA PARA YYYY-MM-DD
// ======================================================

function converterDataParaFormatoYYYYMMDD(
    isoDateString
) {

    if (!isoDateString) {

        return '';
    }


    // Se já estiver no formato YYYY-MM-DD

    if (isoDateString.length === 10) {

        return isoDateString;
    }


    // Se vier com T, pega somente a parte da data

    const partes =
        isoDateString.split('T');

    return partes[0];
}


// ======================================================
// VERIFICAR SE É FUNCIONÁRIO
// ======================================================

async function funcaoEhFuncionario(pessoaId) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/funcionario/${pessoaId}`
            );


        if (response.status === 404) {

            return {
                ehFuncionario: false
            };
        }


        const data =
            await response.json();


        if (
            response.ok &&
            data.sucesso &&
            data.funcionario
        ) {

            const funcionario =
                data.funcionario;

            return {

                ehFuncionario: true,

                salario_funcionario:
                    funcionario.salario,

                cargo_id_cargo:
                    funcionario.nome_cargo,

                data_admissao_funcionario:
                    funcionario.data_admissao
            };
        }


        return {
            ehFuncionario: false
        };

    } catch (error) {

        console.error(
            'Erro ao verificar se é funcionario:',
            error
        );

        return {
            ehFuncionario: false
        };
    }
}


// ======================================================
// CARREGAR CARGOS DO BANCO DE DADOS
// ======================================================

async function popularCargosSelect() {

    try {

        // Busca os cargos cadastrados no banco

        const response =
            await fetch(
                `${API_BASE_URL}/cargo/listar`
            );


        // Converte a resposta para JSON

        const data =
            await response.json();


        // Pega o select de cargo do HTML

        const selectCargo =
            document.getElementById(
                'cargo_id_cargo'
            );


        // Limpa as opções atuais

        selectCargo.innerHTML = '';


        // Cria a primeira opção

        const opcaoInicial =
            document.createElement('option');


        opcaoInicial.value = '';

        opcaoInicial.textContent =
            'Selecione um cargo';


        // Adiciona a primeira opção

        selectCargo.appendChild(
            opcaoInicial
        );


        // Verifica se conseguiu buscar os cargos

        if (
            response.ok &&
            data.sucesso
        ) {

            // Percorre todos os cargos
            // recebidos do banco

            data.cargos.forEach(cargo => {

                // Cria uma nova opção

                const opcao =
                    document.createElement('option');


                // O valor será o nome do cargo

                opcao.value =
                    cargo.nome_cargo;


                // O texto mostrado será
                // o nome do cargo

                opcao.textContent =
                    cargo.nome_cargo;


                // Adiciona a opção no select

                selectCargo.appendChild(
                    opcao
                );
            });

        } else {

            selectCargo.innerHTML =
                '<option value="">Erro ao carregar cargos</option>';
        }

    } catch (error) {

        console.error(
            'Erro ao carregar cargos:',
            error
        );


        const selectCargo =
            document.getElementById(
                'cargo_id_cargo'
            );


        selectCargo.innerHTML =
            '<option value="">Erro ao carregar cargos</option>';
    }
}


// ======================================================
// VERIFICAR SE É CLIENTE
// ======================================================

async function funcaoEhCliente(pessoaId) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/cliente/${pessoaId}`
            );


        if (response.status === 404) {

            return {
                ehCliente: false
            };
        }


        const data =
            await response.json();


        if (
            response.ok &&
            data.sucesso &&
            data.cliente
        ) {

            return {

                ehCliente: true,

                data_cadastro_cliente:
                    data.cliente.data_cadastro
            };
        }


        return {
            ehCliente: false
        };

    } catch (error) {

        console.error(
            'Erro ao verificar se é cliente:',
            error
        );

        return {
            ehCliente: false
        };
    }
}


// ======================================================
// BUSCAR PESSOA
// ======================================================

async function buscarPessoa() {

    const id =
        searchId.value.trim();


    if (!id) {

        mostrarMensagem(
            'Digite um CPF para buscar',
            'warning'
        );

        return;
    }


    bloquearCampos(false);

    searchId.focus();


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/pessoa/${id}`
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.sucesso
        ) {

            await preencherFormulario(
                data.pessoa
            );


            mostrarBotoes(
                true,
                false,
                true,
                true,
                false,
                false
            );


            mostrarMensagem(
                'Pessoa encontrada!',
                'success'
            );

        } else {

            limparFormulario();

            searchId.value = id;


            mostrarBotoes(
                true,
                true,
                false,
                false,
                false,
                false
            );


            mostrarMensagem(
                'Pessoa não encontrada. Você pode incluir uma nova pessoa.',
                'info'
            );


            bloquearCampos(false);
        }

    } catch (error) {

        console.error(
            'Erro:',
            error
        );


        mostrarMensagem(
            'Erro ao buscar pessoa',
            'error'
        );
    }
}


// ======================================================
// PREENCHER FORMULÁRIO
// ======================================================

async function preencherFormulario(pessoa) {

    currentPersonId =
        pessoa.cpf;


    searchId.value =
        pessoa.cpf;


    // ==================================================
    // PREENCHER NOME
    // ==================================================

    document.getElementById(
        'nome_pessoa'
    ).value =
        pessoa.nome || '';


    // ==================================================
    // PREENCHER EMAIL
    // ==================================================

    document.getElementById(
        'email_pessoa'
    ).value =
        pessoa.email || '';


    // ==================================================
    // PREENCHER DATA DE NASCIMENTO
    // ==================================================

    if (pessoa.data_nascimento) {

        document.getElementById(
            'data_nascimento'
        ).value =
            converterDataParaFormatoYYYYMMDD(
                pessoa.data_nascimento
            );

    } else {

        document.getElementById(
            'data_nascimento'
        ).value =
            '';
    }


    // ==================================================
    // VERIFICA FUNCIONÁRIO
    // ==================================================

    const ehFunc =
        await funcaoEhFuncionario(
            currentPersonId
        );


    if (ehFunc.ehFuncionario) {

        document.getElementById(
            'checkboxFuncionario'
        ).checked = true;


        document.getElementById(
            'cargo_id_cargo'
        ).value =
            ehFunc.cargo_id_cargo || '';


        document.getElementById(
            'salario_funcionario'
        ).value =
            ehFunc.salario_funcionario || '';


        document.getElementById(
            'data_admissao_funcionario'
        ).value =
            converterDataParaFormatoYYYYMMDD(
                ehFunc.data_admissao_funcionario
            );

    } else {

        document.getElementById(
            'checkboxFuncionario'
        ).checked = false;


        document.getElementById(
            'cargo_id_cargo'
        ).value = '';


        document.getElementById(
            'salario_funcionario'
        ).value = '';


        document.getElementById(
            'data_admissao_funcionario'
        ).value = '';
    }


    // ==================================================
    // VERIFICA CLIENTE
    // ==================================================

    const ehCli =
        await funcaoEhCliente(
            currentPersonId
        );


    if (ehCli.ehCliente) {

        document.getElementById(
            'checkboxCliente'
        ).checked = true;


        document.getElementById(
            'data_cadastro_cliente'
        ).value =
            converterDataParaFormatoYYYYMMDD(
                ehCli.data_cadastro_cliente
            );

    } else {

        document.getElementById(
            'checkboxCliente'
        ).checked = false;


        document.getElementById(
            'data_cadastro_cliente'
        ).value = '';
    }
}


// ======================================================
// INCLUIR PESSOA
// ======================================================

async function incluirPessoa() {

    mostrarMensagem(
        'Digite os dados!',
        'success'
    );


    currentPersonId =
        searchId.value;


    limparFormulario();


    searchId.value =
        currentPersonId;


    bloquearCampos(true);


    mostrarBotoes(
        false,
        false,
        false,
        false,
        true,
        true
    );


    document.getElementById(
        'nome_pessoa'
    ).focus();


    operacao = 'incluir';
}


// ======================================================
// ALTERAR PESSOA
// ======================================================

async function alterarPessoa() {

    mostrarMensagem(
        'Digite os dados!',
        'success'
    );


    bloquearCampos(true);


    mostrarBotoes(
        false,
        false,
        false,
        false,
        true,
        true
    );


    document.getElementById(
        'nome_pessoa'
    ).focus();


    operacao = 'alterar';
}


// ======================================================
// EXCLUIR PESSOA
// ======================================================

async function excluirPessoa() {

    mostrarMensagem(
        'Excluindo pessoa...',
        'info'
    );


    currentPersonId =
        searchId.value;


    searchId.disabled = true;


    bloquearCampos(false);


    mostrarBotoes(
        false,
        false,
        false,
        false,
        true,
        true
    );


    operacao = 'excluir';
}


// ======================================================
// SALVAR OPERAÇÃO
// ======================================================

async function salvarOperacao() {

    const formData =
        new FormData(form);


    // ==================================================
    // DADOS DA PESSOA
    // ==================================================

    const pessoa = {

        cpf:
            searchId.value.trim(),

        nome:
            formData.get('nome_pessoa'),

        data_nascimento:
            converterDataParaISO(
                formData.get('data_nascimento')
            ) || null,

        email:
            formData.get('email_pessoa')
    };


    // ==================================================
    // DADOS DO FUNCIONÁRIO
    // ==================================================

    let funcionario = null;


    if (
        document.getElementById(
            'checkboxFuncionario'
        ).checked
    ) {

        funcionario = {

            cpf:
                pessoa.cpf,

            salario:
                document.getElementById(
                    'salario_funcionario'
                ).value,

            nome_cargo:
                document.getElementById(
                    'cargo_id_cargo'
                ).value,

            data_admissao:
                converterDataParaISO(
                    document.getElementById(
                        'data_admissao_funcionario'
                    ).value
                ) || null
        };
    }


    const caminhoFunc =
        `${API_BASE_URL}/funcionario/${currentPersonId}`;


    // ==================================================
    // DADOS DO CLIENTE
    // ==================================================

    let cliente = null;


    if (
        document.getElementById(
            'checkboxCliente'
        ).checked
    ) {

        cliente = {

            cpf:
                pessoa.cpf,

            data_cadastro:
                converterDataParaISO(
                    document.getElementById(
                        'data_cadastro_cliente'
                    ).value
                ) || null
        };
    }


    const caminhoCliente =
        `${API_BASE_URL}/cliente/${currentPersonId}`;


    // ==================================================
    // EXECUTA A OPERAÇÃO
    // ==================================================

    try {

        let respPessoa = null;


        // ==================================================
        // INCLUIR
        // ==================================================

        switch (operacao) {

            case 'incluir':

                respPessoa =
                    await fetch(
                        `${API_BASE_URL}/pessoa`,
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify(pessoa)
                        }
                    );


                const dataPessoaInc =
                    await respPessoa.json();


                if (
                    !respPessoa.ok ||
                    !dataPessoaInc.sucesso
                ) {

                    throw new Error(
                        'Erro ao criar pessoa: ' +
                        (
                            dataPessoaInc.mensagem ||
                            respPessoa.status
                        )
                    );
                }


                // ==================================================
                // CADASTRA FUNCIONÁRIO
                // ==================================================

                if (funcionario) {

                    const respFunc =
                        await fetch(
                            `${API_BASE_URL}/funcionario`,
                            {
                                method: 'POST',

                                headers: {
                                    'Content-Type':
                                        'application/json'
                                },

                                body:
                                    JSON.stringify(funcionario)
                            }
                        );


                    if (!respFunc.ok) {

                        const erroFunc =
                            await respFunc
                                .json()
                                .catch(() => ({}));


                        throw new Error(
                            erroFunc.error ||
                            erroFunc.mensagem ||
                            'Erro ao cadastrar funcionário'
                        );
                    }
                }


                // ==================================================
                // CADASTRA CLIENTE
                // ==================================================

                if (cliente) {

                    const respCli =
                        await fetch(
                            `${API_BASE_URL}/cliente`,
                            {
                                method: 'POST',

                                headers: {
                                    'Content-Type':
                                        'application/json'
                                },

                                body:
                                    JSON.stringify(cliente)
                            }
                        );


                    if (!respCli.ok) {

                        const erroCli =
                            await respCli
                                .json()
                                .catch(() => ({}));


                        throw new Error(
                            erroCli.error ||
                            erroCli.mensagem ||
                            'Erro ao cadastrar cliente'
                        );
                    }
                }


                mostrarMensagem(
                    'Pessoa incluída com sucesso!',
                    'success'
                );


                limparFormulario();

                carregarPessoas();

                break;


            // ==================================================
            // ALTERAR
            // ==================================================

            case 'alterar':

                respPessoa =
                    await fetch(
                        `${API_BASE_URL}/pessoa/${currentPersonId}`,
                        {
                            method: 'PUT',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify(pessoa)
                        }
                    );


                const dataPessoaAlt =
                    await respPessoa.json();


                if (
                    !respPessoa.ok ||
                    !dataPessoaAlt.sucesso
                ) {

                    throw new Error(
                        'Erro ao alterar pessoa: ' +
                        (
                            dataPessoaAlt.mensagem ||
                            respPessoa.status
                        )
                    );
                }


                // ==================================================
                // TRATA CLIENTE
                // ==================================================

                if (
                    document.getElementById(
                        'checkboxCliente'
                    ).checked
                ) {

                    // Verifica se já existe como cliente

                    const respVerifCli =
                        await fetch(
                            caminhoCliente
                        );


                    // ==================================================
                    // A PESSOA AINDA NÃO É CLIENTE
                    // ==================================================

                    if (
                        respVerifCli.status === 404
                    ) {

                        const respCriarCli =
                            await fetch(
                                `${API_BASE_URL}/cliente`,
                                {
                                    method: 'POST',

                                    headers: {
                                        'Content-Type':
                                            'application/json'
                                    },

                                    body:
                                        JSON.stringify(cliente)
                                }
                            );


                        const dataCriarCli =
                            await respCriarCli
                                .json()
                                .catch(() => ({}));


                        // Verifica se realmente criou

                        if (!respCriarCli.ok) {

                            throw new Error(
                                dataCriarCli.error ||
                                dataCriarCli.mensagem ||
                                'Erro ao cadastrar cliente'
                            );
                        }


                    // ==================================================
                    // A PESSOA JÁ É CLIENTE
                    // ==================================================

                    } else if (
                        respVerifCli.ok
                    ) {

                        const respAlterarCli =
                            await fetch(
                                caminhoCliente,
                                {
                                    method: 'PUT',

                                    headers: {
                                        'Content-Type':
                                            'application/json'
                                    },

                                    body:
                                        JSON.stringify(cliente)
                                }
                            );


                        const dataAlterarCli =
                            await respAlterarCli
                                .json()
                                .catch(() => ({}));


                        // Verifica se realmente alterou

                        if (!respAlterarCli.ok) {

                            throw new Error(
                                dataAlterarCli.error ||
                                dataAlterarCli.mensagem ||
                                'Erro ao alterar cliente'
                            );
                        }


                    // ==================================================
                    // ERRO AO VERIFICAR CLIENTE
                    // ==================================================

                    } else {

                        const dataErroCli =
                            await respVerifCli
                                .json()
                                .catch(() => ({}));


                        throw new Error(
                            dataErroCli.error ||
                            dataErroCli.mensagem ||
                            'Erro ao verificar cliente'
                        );
                    }


                } else {

                    // ==================================================
                    // CHECKBOX CLIENTE DESMARCADO
                    // REMOVE O CLIENTE
                    // ==================================================

                    const respCli =
                        await fetch(
                            caminhoCliente,
                            {
                                method: 'DELETE'
                            }
                        );


                    // Se não existe cliente,
                    // não há nada para excluir

                    if (
                        respCli.status === 404
                    ) {

                        // Não faz nada

                    } else if (
                        !respCli.ok
                    ) {

                        const dataCli =
                            await respCli
                                .json()
                                .catch(() => ({}));


                        throw new Error(
                            dataCli.error ||
                            'Não foi possível remover o cliente'
                        );
                    }
                }


                // ==================================================
                // TRATA FUNCIONÁRIO
                // ==================================================

                if (
                    document.getElementById(
                        'checkboxFuncionario'
                    ).checked
                ) {

                    const respVerifFunc =
                        await fetch(
                            caminhoFunc
                        );


                    if (
                        respVerifFunc.status === 404
                    ) {

                        const respCriarFunc =
                            await fetch(
                                `${API_BASE_URL}/funcionario`,
                                {
                                    method: 'POST',

                                    headers: {
                                        'Content-Type':
                                            'application/json'
                                    },

                                    body:
                                        JSON.stringify(funcionario)
                                }
                            );


                        if (!respCriarFunc.ok) {

                            const erroFunc =
                                await respCriarFunc
                                    .json()
                                    .catch(() => ({}));


                            throw new Error(
                                erroFunc.error ||
                                erroFunc.mensagem ||
                                'Erro ao cadastrar funcionário'
                            );
                        }

                    } else if (
                        respVerifFunc.ok
                    ) {

                        const respAlterarFunc =
                            await fetch(
                                caminhoFunc,
                                {
                                    method: 'PUT',

                                    headers: {
                                        'Content-Type':
                                            'application/json'
                                    },

                                    body:
                                        JSON.stringify(funcionario)
                                }
                            );


                        if (!respAlterarFunc.ok) {

                            const erroFunc =
                                await respAlterarFunc
                                    .json()
                                    .catch(() => ({}));


                            throw new Error(
                                erroFunc.error ||
                                erroFunc.mensagem ||
                                'Erro ao alterar funcionário'
                            );
                        }
                    }

                } else {

                    // ==================================================
                    // CHECKBOX FUNCIONÁRIO DESMARCADO
                    // REMOVE O FUNCIONÁRIO
                    // ==================================================

                    const respVerifFunc =
                        await fetch(
                            caminhoFunc
                        );


                    if (
                        respVerifFunc.status === 200
                    ) {

                        const respExcluirFunc =
                            await fetch(
                                caminhoFunc,
                                {
                                    method: 'DELETE'
                                }
                            );


                        if (!respExcluirFunc.ok) {

                            const erroFunc =
                                await respExcluirFunc
                                    .json()
                                    .catch(() => ({}));


                            throw new Error(
                                erroFunc.error ||
                                erroFunc.mensagem ||
                                'Erro ao excluir funcionário'
                            );
                        }
                    }
                }


                mostrarMensagem(
                    'Pessoa alterada com sucesso!',
                    'success'
                );


                limparFormulario();

                carregarPessoas();

                break;


            // ==================================================
            // EXCLUIR
            // ==================================================

            case 'excluir':

                // Exclui cliente primeiro

                const respCliDel =
                    await fetch(
                        caminhoCliente
                    );


                if (
                    respCliDel.status === 200
                ) {

                    await fetch(
                        caminhoCliente,
                        {
                            method: 'DELETE'
                        }
                    );
                }


                // Exclui funcionário

                const respFuncDel =
                    await fetch(
                        caminhoFunc
                    );


                if (
                    respFuncDel.status === 200
                ) {

                    await fetch(
                        caminhoFunc,
                        {
                            method: 'DELETE'
                        }
                    );
                }


                // Exclui pessoa

                const respDelPessoa =
                    await fetch(
                        `${API_BASE_URL}/pessoa/${currentPersonId}`,
                        {
                            method: 'DELETE'
                        }
                    );


                const dataDelPessoa =
                    await respDelPessoa
                        .json()
                        .catch(() => ({}));


                if (
                    !respDelPessoa.ok ||
                    !dataDelPessoa.sucesso
                ) {

                    throw new Error(
                        'Erro ao excluir pessoa: ' +
                        (
                            dataDelPessoa.mensagem ||
                            dataDelPessoa.error ||
                            respDelPessoa.status
                        )
                    );
                }


                mostrarMensagem(
                    'Pessoa excluída com sucesso!',
                    'success'
                );


                limparFormulario();

                carregarPessoas();

                break;
        }

    } catch (error) {

        console.error(
            'Erro salvarOperacao:',
            error
        );


        mostrarMensagem(
            error.message ||
            'Erro ao processar operação',
            'error'
        );

    } finally {

        mostrarBotoes(
            true,
            false,
            false,
            false,
            false,
            false
        );


        bloquearCampos(false);


        searchId.disabled = false;


        document.getElementById(
            'searchId'
        ).focus();
    }
}


// ======================================================
// CANCELAR OPERAÇÃO
// ======================================================

function cancelarOperacao() {

    limparFormulario();


    mostrarBotoes(
        true,
        false,
        false,
        false,
        false,
        false
    );


    bloquearCampos(false);


    searchId.disabled = false;


    document.getElementById(
        'searchId'
    ).focus();


    mostrarMensagem(
        'Operação cancelada',
        'info'
    );
}


// ======================================================
// CARREGAR PESSOAS
// ======================================================

async function carregarPessoas() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/pessoa`
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.sucesso
        ) {

            renderizarTabelaPessoas(
                data.pessoas
            );

        } else {

            throw new Error(
                data.mensagem ||
                'Erro ao carregar pessoas'
            );
        }

    } catch (error) {

        console.error(
            'Erro:',
            error
        );


        mostrarMensagem(
            'Erro ao carregar lista de pessoas',
            'error'
        );
    }
}


// ======================================================
// RENDERIZAR TABELA
// ======================================================

function renderizarTabelaPessoas(pessoas) {

    pessoasTableBody.innerHTML = '';


    pessoas.forEach(pessoa => {

        const row =
            document.createElement('tr');


        row.innerHTML = `

            <td>
                <button
                    class="btn-id"
                    onclick="selecionarPessoa('${pessoa.cpf}')"
                >
                    ${pessoa.cpf}
                </button>
            </td>

            <td>
                ${pessoa.nome}
            </td>

            <td>
                ${pessoa.email}
            </td>

            <td>
                ${formatarData(
                    pessoa.data_nascimento
                )}
            </td>

        `;


        pessoasTableBody.appendChild(row);
    });
}


// ======================================================
// SELECIONAR PESSOA
// ======================================================

async function selecionarPessoa(id) {

    searchId.value = id;

    await buscarPessoa();
}