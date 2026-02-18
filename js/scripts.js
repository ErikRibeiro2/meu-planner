// --- 1. ESTADO E PERSISTÊNCIA ---

// Tenta pegar do LocalStorage. Se não tiver nada, inicia vazio.
const dadosSalvos = localStorage.getItem('meu-planner-dados');
let estado = dadosSalvos ? JSON.parse(dadosSalvos) : { colunas: [] };

// Controle do Drag and Drop
let itemArrastado = null; // Vai guardar: { idColuna: 1, idTarefa: 105 }

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
    localStorage.setItem('meu-planner-dados', JSON.stringify(estado));

    estado.colunas.forEach(coluna => {
        const colunaDiv = document.createElement('div');
        colunaDiv.className = 'coluna';
        
        // EVENTOS DE DROP NA COLUNA (A Área de Pouso)
        // 1. dragover: "Ei, pode soltar coisas aqui"
        colunaDiv.addEventListener('dragover', (e) => {
            e.preventDefault(); // Obrigatório para permitir o Drop
            colunaDiv.classList.add('coluna-highlight'); // Efeito visual
        });

        // 2. dragleave: "Saiu de cima da coluna, tira o efeito visual"
        colunaDiv.addEventListener('dragleave', () => {
            colunaDiv.classList.remove('coluna-highlight');
        });

        // 3. drop: "Soltou a bomba aqui!"
        colunaDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            colunaDiv.classList.remove('coluna-highlight');
            moverTarefa(coluna.id); // CHAMA A FUNÇÃO MÁGICA
        });

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
            
            // HABILITAR ARRASTO NO CARD
            card.setAttribute('draggable', true); // HTML5 API
            
            // EVENTO DE INÍCIO (Pegou o card)
            card.addEventListener('dragstart', (e) => {
                itemArrastado = { idColuna: coluna.id, idTarefa: tarefa.id };
                card.classList.add('card-dragging'); // Estilo visual
                e.dataTransfer.effectAllowed = "move"; // Cursor de movimento
            });

            // EVENTO DE FIM (Soltou em qualquer lugar, mesmo fora)
            card.addEventListener('dragend', () => {
                card.classList.remove('card-dragging');
                itemArrastado = null; // Limpa a variável
            });

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

function moverTarefa(idColunaDestino) {
    // Segurança: Se não estiver arrastando nada ou soltar na mesma coluna, não faz nada
    if (!itemArrastado || itemArrastado.idColuna === idColunaDestino) return;

    // 1. Achar a coluna de ORIGEM e DESTINO no banco de dados (estado)
    const colunaOrigem = estado.colunas.find(c => c.id === itemArrastado.idColuna);
    const colunaDestino = estado.colunas.find(c => c.id === idColunaDestino);

    // 2. Achar a TAREFA específica
    const tarefa = colunaOrigem.tarefas.find(t => t.id === itemArrastado.idTarefa);

    if (colunaOrigem && colunaDestino && tarefa) {
        // 3. REMOVER da origem (Filter)
        colunaOrigem.tarefas = colunaOrigem.tarefas.filter(t => t.id !== itemArrastado.idTarefa);

        // 4. ADICIONAR no destino (Push)
        colunaDestino.tarefas.push(tarefa);

        // 5. Redesenhar tudo
        renderizarBoard();
    }
}

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