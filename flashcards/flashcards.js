document.addEventListener("DOMContentLoaded", function () {
  const botoesAdicionar = document.querySelectorAll(".btn-add-flashcard");
  const botoesExcluir = document.querySelectorAll(".btn-remove-all");

  botoesAdicionar.forEach((botao) => {
    botao.addEventListener("click", () => {
      const semana = botao.getAttribute("data-semana");
      adicionarFormulario(semana);
    });
  });

  botoesExcluir.forEach((botao) => {
    botao.addEventListener("click", () => {
      const semana = botao.getAttribute("data-semana");
      if (confirm(`Tem certeza que deseja excluir todos os flashcards da semana ${semana}?`)) {
        excluirTodosDaSemana(semana);
      }
    });
  });

  carregarFlashcards();
});

function adicionarFormulario(semana) {
  const container = document.getElementById(`flashcards-semana-${semana}`);
  const form = document.createElement("div");
  form.innerHTML = `
    <div class="mb-3">
      <input type="text" class="form-control pergunta" placeholder="Digite a pergunta">
    </div>
    <div class="mb-3">
      <input type="text" class="form-control resposta" placeholder="Digite a resposta">
    </div>
    <button class="btn btn-success salvar">Salvar</button>
  `;
  container.appendChild(form);

  form.querySelector(".salvar").addEventListener("click", () => {
    const perguntaInput = form.querySelector(".pergunta");
    const respostaInput = form.querySelector(".resposta");
    if (perguntaInput.value && respostaInput.value) {
      salvarFlashcard(semana, perguntaInput.value, respostaInput.value);
      container.removeChild(form);
    }
  });
}

function salvarFlashcard(semana, pergunta, resposta) {
  salvarNoStorage(semana, pergunta, resposta);
  renderizarFlashcard(semana, pergunta, resposta);
  atualizarVisibilidadeBotaoExcluir(semana);
}

function renderizarFlashcard(semana, pergunta, resposta) {
  const container = document.getElementById(`flashcards-semana-${semana}`);

  const wrapper = document.createElement("div");
  wrapper.className = "flashcard-wrapper position-relative";

  const card = document.createElement("div");
  card.className = "flashcard";

  card.innerHTML = `
    <div class="flashcard-face flashcard-front">${pergunta}</div>
    <div class="flashcard-face flashcard-back">${resposta}</div>
  `;

  card.addEventListener("click", () => {
    card.classList.toggle("flipped");
  });

  const btnExcluir = document.createElement("button");
  btnExcluir.className = "btn btn-sm btn-danger position-absolute bottom-0 end-0 m-2";
  btnExcluir.textContent = "-";
  btnExcluir.title = "Deletar card";

  btnExcluir.addEventListener("click", (e) => {
    e.stopPropagation();
    if (confirm("Deseja apagar este card?")) {
      wrapper.remove();
      deletarDoStorage(semana, pergunta, resposta);
      atualizarVisibilidadeBotaoExcluir(semana);
    }
  });

  wrapper.appendChild(card);
  wrapper.appendChild(btnExcluir);
  container.appendChild(wrapper);

  atualizarVisibilidadeBotaoExcluir(semana);
}

function salvarNoStorage(semana, pergunta, resposta) {
  const dados = JSON.parse(localStorage.getItem("flashcards")) || {};
  dados[semana] = dados[semana] || [];
  dados[semana].push({ pergunta, resposta });
  localStorage.setItem("flashcards", JSON.stringify(dados));
}

function carregarFlashcards() {
  const dados = JSON.parse(localStorage.getItem("flashcards")) || {};
  Object.keys(dados).forEach((semana) => {
    dados[semana].forEach((card) => {
      renderizarFlashcard(semana, card.pergunta, card.resposta);
    });
    atualizarVisibilidadeBotaoExcluir(semana);
  });
}

function deletarDoStorage(semana, pergunta, resposta) {
  const dados = JSON.parse(localStorage.getItem("flashcards")) || {};
  if (!dados[semana]) return;

  dados[semana] = dados[semana].filter(
    (card) => card.pergunta !== pergunta || card.resposta !== resposta
  );

  if (dados[semana].length === 0) {
    delete dados[semana];
  }

  localStorage.setItem("flashcards", JSON.stringify(dados));
}

function excluirTodosDaSemana(semana) {
  const container = document.getElementById(`flashcards-semana-${semana}`);
  container.innerHTML = "";

  const dados = JSON.parse(localStorage.getItem("flashcards")) || {};
  delete dados[semana];
  localStorage.setItem("flashcards", JSON.stringify(dados));

  atualizarVisibilidadeBotaoExcluir(semana);
}

function atualizarVisibilidadeBotaoExcluir(semana) {
  const container = document.getElementById(`flashcards-semana-${semana}`);
  const btnExcluir = document.querySelector(`.btn-remove-all[data-semana="${semana}"]`);

  if (container && btnExcluir) {
    const temFlashcards = container.querySelector(".flashcard-wrapper");

    if (temFlashcards) {
      btnExcluir.classList.remove("d-none"); // Mostra o botão
    } else {
      btnExcluir.classList.add("d-none"); // Esconde o botão
    }
  }
}

