document.addEventListener("DOMContentLoaded", function () {
  // Elementos DOM frequentemente usados
  const exercisesList = document.getElementById("exercisesList");
  const noExercisesMsg = document.getElementById("noExercisesMsg");
  const totalCaloriesEl = document.getElementById("totalCalories");
  const totalTimeEl = document.getElementById("totalTime");
  const totalWorkoutsEl = document.getElementById("totalWorkouts");
  const workoutProgressEl = document.getElementById("workoutProgress");
  const progressTextEl = document.getElementById("progressText");
  const weeklyGoalEl = document.getElementById("weeklyGoal");
  const saveGoalBtn = document.getElementById("saveGoalBtn");
  const loginBtn = document.getElementById("loginBtn");

  // Modais
  const addExerciseModal = new bootstrap.Modal(
    document.getElementById("addExerciseModal")
  );
  const authModal = new bootstrap.Modal(document.getElementById("authModal"));

  // Dados do usuário simulados (seria substituído por um sistema de autenticação real)
  let user = {
    isLoggedIn: false,
    name: "",
    email: "",
    weeklyGoal: 3,
  };

  // Inicialização dos dados
  let exercises = JSON.parse(localStorage.getItem("exercises")) || [];
  user.weeklyGoal = localStorage.getItem("weeklyGoal")
    ? parseInt(localStorage.getItem("weeklyGoal"))
    : 3;
  weeklyGoalEl.value = user.weeklyGoal;

  // Ícones para os diferentes tipos de exercício
  const exerciseIcons = {
    running: "fa-running",
    cycling: "fa-biking",
    swimming: "fa-swimmer",
    weights: "fa-dumbbell",
    yoga: "fa-om",
    other: "fa-heartbeat",
  };

  // Nome dos exercícios em português
  const exerciseNames = {
    running: "Corrida",
    cycling: "Ciclismo",
    swimming: "Natação",
    weights: "Musculação",
    yoga: "Yoga",
    other: "Outro",
  };

  // Inicializar o gráfico semanal
  let weeklyChart;
  initializeWeeklyChart();

  // Renderizar a lista de exercícios e atualizar estatísticas
  renderExercises();
  updateStatistics();

  // Event Listeners
  document
    .getElementById("saveExerciseBtn")
    .addEventListener("click", saveExercise);
  document
    .getElementById("loginBtn")
    .addEventListener("click", () => authModal.show());
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document
    .getElementById("registerForm")
    .addEventListener("submit", handleRegister);
  saveGoalBtn.addEventListener("click", saveWeeklyGoal);

  // Definir a data atual no campo de data do formulário
  document.getElementById("exerciseDate").valueAsDate = new Date();

  // Funções
  // Salvar um novo exercício
  function saveExercise(e) {
    e.preventDefault();
    const type = document.getElementById("exerciseType").value;
    const date = document.getElementById("exerciseDate").value;
    const duration = parseInt(
      document.getElementById("exerciseDuration").value
    );
    const calories =
      parseInt(document.getElementById("exerciseCalories").value) ||
      calculateEstimatedCalories(type, duration);
    const notes = document.getElementById("exerciseNotes").value;
    if (!type || !date || !duration) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    const newExercise = {
      id: Date.now(),
      type,
      date,
      duration,
      calories,
      notes,
    };
    exercises.unshift(newExercise); // Adiciona no início do array
    localStorage.setItem("exercises", JSON.stringify(exercises));
    renderExercises();
    updateStatistics();
    updateWeeklyChart();
    addExerciseModal.hide();
    document.getElementById("exerciseForm").reset();
    document.getElementById("exerciseDate").valueAsDate = new Date();
  }

  // Renderizar a lista de exercícios
  function renderExercises() {
    if (exercises.length === 0) {
      noExercisesMsg.style.display = "block";
      exercisesList.innerHTML = "";
      return;
    }
    noExercisesMsg.style.display = "none";
    exercisesList.innerHTML = "";
    exercises.forEach((exercise) => {
      const date = new Date(exercise.date);
      const formattedDate = date.toLocaleDateString("pt-BR");
      const exerciseItem = document.createElement("div");
      exerciseItem.className = `list-group-item exercise-item ${exercise.type} d-flex align-items-center mb-2`;
      exerciseItem.innerHTML = `
              <div class="exercise-icon">
                  <i class="fas ${exerciseIcons[exercise.type]}"></i>
              </div>
              <div class="flex-grow-1">
                  <h6 class="mb-0">${exerciseNames[exercise.type]}</h6>
                  <div class="d-flex text-muted small">
                      <div class="me-3"><i class="far fa-calendar me-1"></i>${formattedDate}</div>
                      <div class="me-3"><i class="far fa-clock me-1"></i>${
                        exercise.duration
                      } min</div>
                      <div><i class="fas fa-fire me-1"></i>${
                        exercise.calories
                      } cal</div>
                  </div>
                  ${
                    exercise.notes
                      ? `<p class="mt-1 mb-0 small text-muted">${exercise.notes}</p>`
                      : ""
                  }
              </div>
              <button class="btn btn-sm text-danger btn-delete-exercise" data-id="${
                exercise.id
              }">
                  <i class="fas fa-trash"></i>
              </button>
          `;
      exercisesList.appendChild(exerciseItem);
      // Adicionar listener para o botão de exclusão
      exerciseItem
        .querySelector(".btn-delete-exercise")
        .addEventListener("click", function () {
          deleteExercise(exercise.id);
        });
    });
  }

  // Excluir um exercício
  function deleteExercise(id) {
    if (confirm("Tem certeza que deseja excluir este exercício?")) {
      exercises = exercises.filter((exercise) => exercise.id !== id);
      localStorage.setItem("exercises", JSON.stringify(exercises));
      renderExercises();
      updateStatistics();
      updateWeeklyChart();
    }
  }

  // Atualizar estatísticas
  function updateStatistics() {
    // Calcular estatísticas da semana atual
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo como início da semana
    startOfWeek.setHours(0, 0, 0, 0);
    const weeklyExercises = exercises.filter((exercise) => {
      const exerciseDate = new Date(exercise.date);
      return exerciseDate >= startOfWeek;
    });
    const totalCalories = weeklyExercises.reduce(
      (sum, exercise) => sum + exercise.calories,
      0
    );
    const totalTime = weeklyExercises.reduce(
      (sum, exercise) => sum + exercise.duration,
      0
    );
    const totalWorkouts = weeklyExercises.length;
    totalCaloriesEl.textContent = totalCalories;
    totalTimeEl.textContent = totalTime;
    totalWorkoutsEl.textContent = totalWorkouts;
    // Atualizar progresso da meta semanal
    const progress = (totalWorkouts / user.weeklyGoal) * 100;
    workoutProgressEl.style.width = `${Math.min(progress, 100)}%`;
    progressTextEl.textContent = `${totalWorkouts}/${user.weeklyGoal}`;
  }

  // Inicializar gráfico semanal
  function initializeWeeklyChart() {
    const ctx = document.getElementById("weeklyChart").getContext("2d");
    weeklyChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        datasets: [
          {
            label: "Minutos de Exercício",
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(13, 110, 253, 0.5)",
            borderColor: "#0d6efd",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
    updateWeeklyChart();
  }

  // Atualizar dados do gráfico semanal
  function updateWeeklyChart() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo como início da semana
    startOfWeek.setHours(0, 0, 0, 0);
    // Inicializar array para cada dia da semana
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    exercises.forEach((exercise) => {
      const exerciseDate = new Date(exercise.date);
      if (exerciseDate >= startOfWeek) {
        const dayOfWeek = exerciseDate.getDay(); // 0 = Domingo, 6 = Sábado
        weeklyData[dayOfWeek] += exercise.duration;
      }
    });
    weeklyChart.data.datasets[0].data = weeklyData;
    weeklyChart.update();
  }

  // Salvar meta semanal
  function saveWeeklyGoal() {
    const newGoal = parseInt(weeklyGoalEl.value);
    if (newGoal < 1) {
      alert("Por favor, insira um valor válido para sua meta semanal.");
      return;
    }
    user.weeklyGoal = newGoal;
    localStorage.setItem("weeklyGoal", newGoal);
    updateStatistics();
    alert("Meta semanal atualizada com sucesso!");
  }

  // Calcular estimativa de calorias baseado no tipo e duração
  function calculateEstimatedCalories(type, duration) {
    const caloriesPerMinute = {
      running: 10,
      cycling: 7,
      swimming: 8,
      weights: 5,
      yoga: 3,
      other: 5,
    };
    return Math.round(caloriesPerMinute[type] * duration);
  }

  // Funções de autenticação (simuladas para o protótipo)
  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    // Simulando uma autenticação bem-sucedida
    user.isLoggedIn = true;
    user.name = "Usuário";
    user.email = email;
    authModal.hide();
    updateUIAfterAuth();
    alert("Login realizado com sucesso!");
  }

  function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }
    // Simulando um registro bem-sucedido
    user.isLoggedIn = true;
    user.name = name;
    user.email = email;
    authModal.hide();
    updateUIAfterAuth();
    alert("Cadastro realizado com sucesso!");
  }

  function updateUIAfterAuth() {
    loginBtn.textContent = user.name;
    loginBtn.href = "profile.html";
  }
});

function validateForm(form) {
  const inputs = form.querySelectorAll("[required]");
  let isValid = true;

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.classList.add("is-invalid");
      isValid = false;
    } else {
      input.classList.remove("is-invalid");
    }
  });

  return isValid;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registrado:", registration);
      })
      .catch((error) => {
        console.error("Falha ao registrar o Service Worker:", error);
      });
  });
}
