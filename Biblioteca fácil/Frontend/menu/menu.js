// Define o endereço onde o servidor backend está funcionando
const URL_API = 'http://localhost:3001';

// Espera a página terminar de carregar antes de executar o código
document.addEventListener('DOMContentLoaded', async () => {

// Tenta executar uma conexão com o servidor backend
try {

    // Faz uma requisição para a rota de listagem de livros
    const resposta = await fetch(`${URL_API}/livro/listar`);

    // Verifica se o servidor respondeu corretamente
    if (resposta.ok) {

        // Mostra uma mensagem no console informando que o backend está conectado
        console.log('Servidor backend conectado com sucesso!');

    }

// Caso aconteça algum erro na tentativa de conexão
} catch (erro) {

    // Mostra um aviso no console informando que não foi possível conectar
    console.warn(
        'Aviso: Não foi possível conectar ao servidor backend em ' + URL_API
    );

}

});
