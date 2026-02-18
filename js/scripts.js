// --- 1. ESTADO E PERSISTÊNCIA ---

// Tenta pegar do LocalStorage. Se não tiver nada, inicia vazio.
const dadosSalvos = localStorage.getItem('meu-planner-dados');
let estado = dadosSalvos ? JSON.parse(dadosSalvos) : { colunas: [] };

let tipoCriacao = null; 
let idColunaAlvo = null; 

// SELETORES
const board = document.getElementById('board');
const modal = document.getElementById('modal');
const modalTitulo = document.getElementById('modal-titulo');
const modalInput = document.getElementById('modal-input');
const btnConfirmar = document.getElementById('btn-confirmar');
const btnCancelar = document.getElementById('btn-cancelar');
const btnNovaColuna = document.getElementById('btn-nova-coluna');

// --- 2. FUNÇÃO CORE: RENDERIZAR ---
function renderizarBoard() {
    board.innerHTML = ''; 

    // NEW: Toda vez que desenhamos, salvamos o estado atual no navegador!
    localStorage.setItem('meu-planner-dados', JSON.stringify(estado));

    estado.colunas.forEach(coluna => {
        const colunaDiv = document.createElement('div');
        colunaDiv.className = 'coluna';
        
        colunaDiv.innerHTML = `
            <div class="coluna-header">
                <span>${coluna.titulo}</span>
                <button class="btn-delete-col" onclick="deletarColuna(${coluna.id})">✖</button>
            </div>
            <div class="lista-tarefas"></div>
            <button class="btn-add-tarefa" onclick="abrirModalTarefa(${coluna.id})">+ Tarefa</button>
        `;

        const listaTarefasDiv = colunaDiv.querySelector('.lista-tarefas');
        coluna.tarefas.forEach(tarefa => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerText = tarefa.texto;
            card.ondblclick = () => deletarTarefa(coluna.id, tarefa.id);
            listaTarefasDiv.appendChild(card);
        });

        board.appendChild(colunaDiv);
    });
}

// --- 3. CONTROLLERS ---

function adicionarColuna(nome) {
    const novaColuna = { id: Date.now(), titulo: nome, tarefas: [] };
    estado.colunas.push(novaColuna);
    renderizarBoard();
}

function adicionarTarefa(idColuna, texto) {
    const coluna = estado.colunas.find(c => c.id === idColuna);
    if (coluna) {
        coluna.tarefas.push({ id: Date.now(), texto: texto });
        renderizarBoard();
    }
}

function deletarColuna(id) {
    if(confirm("Apagar seção?")) {
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

// Botão extra para limpar tudo se precisar
document.getElementById('btn-reset').addEventListener('click', () => {
    if(confirm("Isso apagará tudo para sempre. Tem certeza?")) {
        estado = { colunas: [] };
        renderizarBoard();
    }
});

// --- 4. MODAL ---
function abrirModal() {
    modal.classList.remove('hidden');
    modalInput.value = '';
    modalInput.focus();
}

function fecharModal() { modal.classList.add('hidden'); }

btnNovaColuna.addEventListener('click', () => {
    tipoCriacao = 'coluna';
    modalTitulo.innerText = "Nova Seção";
    abrirModal();
});

window.abrirModalTarefa = function(idColuna) {
    tipoCriacao = 'tarefa';
    idColunaAlvo = idColuna;
    modalTitulo.innerText = "Nova Tarefa";
    abrirModal();
}

btnConfirmar.addEventListener('click', () => {
    const valor = modalInput.value;
    if (!valor) return alert("Digite um nome!");
    if (tipoCriacao === 'coluna') adicionarColuna(valor);
    else if (tipoCriacao === 'tarefa') adicionarTarefa(idColunaAlvo, valor);
    fecharModal();
});

btnCancelar.addEventListener('click', fecharModal);
modalInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') btnConfirmar.click(); });

// Inicialização
renderizarBoard();