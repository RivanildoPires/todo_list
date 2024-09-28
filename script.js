const urlApi = 'http://localhost:3000';

const entradaTarefa = document.getElementById('todo-input');
const entradaMembro = document.getElementById('member-input');
const botaoAdicionar = document.getElementById('add-todo');
const listaTarefas = document.getElementById('todo-list');
const placarPontuacoes = document.getElementById('score-board');

const buscarTarefas = async () => {
  const resposta = await fetch(`${urlApi}/tarefas`);
  const tarefas = await resposta.json();
  
  renderizarTarefas(tarefas);
};

const buscarPontuacoes = async () => {
  const resposta = await fetch(`${urlApi}/membros`);
  const pontuacoes = await resposta.json();
  
  renderizarPontuacoes(pontuacoes);
};

const renderizarTarefas = (tarefas) => {
  listaTarefas.innerHTML = '';
  tarefas.forEach(tarefa => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

    li.innerHTML = `
      ${tarefa.nome_tarefa} - ${tarefa.membro_responsavel} (${tarefa.feita ? "Feita" : "Não feita"})
      <button class="btn btn-danger btn-sm" data-id="${tarefa.id}">X</button>
    `;
    listaTarefas.appendChild(li);

    li.querySelector('.btn-danger').addEventListener('click', () => deletarTarefa(tarefa.id));

    if (!tarefa.feita) {
      li.addEventListener('click', () => concluirTarefa(tarefa.id, tarefa.membro_responsavel));
    }
  });
};

const renderizarPontuacoes = (pontuacoes) => {
  placarPontuacoes.innerHTML = '';
  pontuacoes.forEach(pontuacao => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.innerHTML = `${pontuacao.nome}: ${pontuacao.pontos} pontos`;
    placarPontuacoes.appendChild(li);
  });
};

const adicionarTarefa = async () => {
  const texto = entradaTarefa.value;
  const membro = entradaMembro.value;
  if (!texto || !membro) return;

  const novaTarefa = {
    nome_tarefa: texto,
    data_tarefa: new Date().toISOString().split('T')[0],
    feita: false,
    membro_responsavel: membro
  };

  await fetch(`${urlApi}/tarefas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(novaTarefa)
  });

  entradaTarefa.value = '';
  entradaMembro.value = '';
  buscarTarefas();
};

const deletarTarefa = async (id) => {
  await fetch(`${urlApi}/tarefas/${id}`, {
    method: 'DELETE'
  });
  buscarTarefas();
};

const concluirTarefa = async (id, membro) => {
  const resposta = await fetch(`${urlApi}/tarefas/${id}`);
  const tarefa = await resposta.json();

  const tarefaAtualizada = {
    ...tarefa,
    feita: true
  };

  await fetch(`${urlApi}/tarefas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tarefaAtualizada)
  });

  await atualizarPontuacao(membro);

  buscarTarefas();
};

const atualizarPontuacao = async (membro) => {
  const resposta = await fetch(`${urlApi}/membros?nome=${membro}`);
  const membros = await resposta.json();

  if (membros.length > 0) {
    const membroEncontrado = membros[0];
    membroEncontrado.pontos += 1;

    await fetch(`${urlApi}/membros/${membroEncontrado.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(membroEncontrado)
    });
  }

  buscarPontuacoes();
};

botaoAdicionar.addEventListener('click', adicionarTarefa);

buscarTarefas();
buscarPontuacoes();
