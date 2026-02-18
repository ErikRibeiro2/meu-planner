// --- 1. ESTADO (MODELO DE DADOS) ---
// Começamos com dados de exemplo para você ver funcionando
let estado = {
    colunas: [
        {
            id: 1,
            titulo: "A Fazer",
            tarefas: [
                { id: 101, texto: "Aprender JS" },
                { id: 102, texto: "Estudar CSS Grid" }
            ]
        },
        {
            id: 2,
            titulo: "Em Progresso",
            tarefas: [
                { id: 201, texto: "Criar o HTML" }
            ]
        }
    ]
};

// Variáveis de controle para saber o que estamos criando (Coluna ou Tarefa)
let tipoCriacao = null; // 'coluna' ou 'tarefa'
let idColunaAlvo = null; // Qual coluna receberá a tarefa

// --- 2. SELETORES DO DOM ---
const board = document.getElementById('board');
const modal = document.getElementById('modal');
const modalTitulo = document.getElementById('modal-titulo');
const modalInput = document.getElementById('modal-input');
const btnConfirmar = document.getElementById('btn-confirmar');
const btnCancelar = document.getElementById('btn-cancelar');
const btnNovaColuna = document.getElementById('btn-nova-coluna');

// --- 3. FUNÇÃO DE RENDERIZAÇÃO (VIEW) ---
// Essa função apaga tudo e desenha de novo baseado no 'estado'
function renderizarBoard() {
    board.innerHTML = ''; // Limpa o quadro

    estado.colunas.forEach(coluna => {
        // Criação dinâmica do HTML da Coluna
        const colunaDiv = document.createElement('div');
        colunaDiv.className = 'coluna';
        
        // Cabeçalho da Coluna
        colunaDiv.innerHTML = `
            <div class="coluna-header">
                <span>${coluna.titulo}</span>
                <button class="btn-delete-col" onclick="deletarColuna(${coluna.id})">✖</button>
            </div>
            <div class="lista-tarefas">
                </div>
            <button class="btn-add-tarefa" onclick="abrirModalTarefa(${coluna.id})">+ Adicionar Tarefa</button>
        `;

        // Inserir as tarefas dentro da coluna
        const listaTarefasDiv = colunaDiv.querySelector('.lista-tarefas');
        coluna.tarefas.forEach(tarefa => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerText = tarefa.texto;
            // Adicionar funcionalidade de delete no clique duplo (exemplo)
            card.ondblclick = () => deletarTarefa(coluna.id, tarefa.id);
            listaTarefasDiv.appendChild(card);
        });

        board.appendChild(colunaDiv);
    });
}

// --- 4. FUNÇÕES DE MANIPULAÇÃO DE DADOS (CONTROLLERS) ---

function adicionarColuna(nome) {
    const novaColuna = {
        id: Date.now(), // Gera um ID único baseado no tempo atual
        titulo: nome,
        tarefas: []
    };
    estado.colunas.push(novaColuna);
    renderizarBoard();
}

function adicionarTarefa(idColuna, texto) {
    const coluna = estado.colunas.find(c => c.id === idColuna);
    if (coluna) {
        coluna.tarefas.push({
            id: Date.now(),
            texto: texto
        });
        renderizarBoard();
    }
}

function deletarColuna(id) {
    if(confirm("Tem certeza que deseja apagar esta seção?")) {
        estado.colunas = estado.colunas.filter(c => c.id !== id);
        renderizarBoard();
    }
}

function deletarTarefa(idColuna, idTarefa) {
    const coluna = estado.colunas.find(c => c.id === idColuna);
    if(coluna) {
        coluna.tarefas = coluna.tarefas.filter(t => t.id !== idTarefa);
        renderizarBoard();
    }
}

// --- 5. LÓGICA DO MODAL (POPUP) ---

function abrirModal() {
    modal.classList.remove('hidden');
    modalInput.value = '';
    modalInput.focus();
}

function fecharModal() {
    modal.classList.add('hidden');
}

// Botão "+ Nova Seção"
btnNovaColuna.addEventListener('click', () => {
    tipoCriacao = 'coluna';
    modalTitulo.innerText = "Nova Seção";
    abrirModal();
});

// Botão "+ Adicionar Tarefa" (Note que precisamos expor essa função para o HTML usar)
window.abrirModalTarefa = function(idColuna) {
    tipoCriacao = 'tarefa';
    idColunaAlvo = idColuna;
    modalTitulo.innerText = "Nova Tarefa";
    abrirModal();
}

// Botão Confirmar no Modal
btnConfirmar.addEventListener('click', () => {
    const valor = modalInput.value;
    if (!valor) return alert("Digite um nome!");

    if (tipoCriacao === 'coluna') {
        adicionarColuna(valor);
    } else if (tipoCriacao === 'tarefa') {
        adicionarTarefa(idColunaAlvo, valor);
    }
    
    fecharModal();
});

btnCancelar.addEventListener('click', fecharModal);

// Permitir dar Enter no input do modal
modalInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') btnConfirmar.click();
});

// --- INICIALIZAÇÃO ---
renderizarBoard(); // Chama a função para desenhar a tela pela primeira vez