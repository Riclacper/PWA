document.addEventListener("DOMContentLoaded", function () {
  // Carregar os dados dos exercícios do localStorage
  const exercises = JSON.parse(localStorage.getItem("exercises")) || [];

  // Elementos DOM
  const profileForm = document.getElementById("profileForm");
  const nameInput = document.getElementById("nameInput");
  const emailInput = document.getElementById("emailInput");
  const ageInput = document.getElementById("ageInput");
  const weightInput = document.getElementById("weightInput");
  const heightInput = document.getElementById("heightInput");
  const logoutBtn = document.getElementById("logoutBtn");
  const clearDataBtn = document.getElementById("clearDataBtn");
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const totalExercisesEl = document.getElementById("totalExercises");
  const totalCaloriesEl = document.getElementById("totalCalories");
  const totalMinutesEl = document.getElementById("totalMinutes");

  // Elementos de permissão
  const locationPermBtn = document.getElementById("locationPermBtn");
  const cameraPermBtn = document.getElementById("cameraPermBtn");
  const motionPermBtn = document.getElementById("motionPermBtn");

  // Carregar perfil do usuário (simulado para o protótipo)
  const userProfile = JSON.parse(localStorage.getItem("userProfile")) || {
    name: "Usuário",
    email: "usuario@exemplo.com",
    age: "",
    weight: "",
    height: "",
  };

  // Preencher formulário com dados do perfil
  nameInput.value = userProfile.name;
  emailInput.value = userProfile.email;
  ageInput.value = userProfile.age;
  weightInput.value = userProfile.weight;
  heightInput.value = userProfile.height;

  // Atualizar cabeçalho do perfil
  profileName.textContent = userProfile.name;
  profileEmail.textContent = userProfile.email;

  // Calcular e exibir estatísticas
  updateStatistics();
  initializeCharts();

  // Event listeners
  profileForm.addEventListener("submit", saveProfile);
  logoutBtn.addEventListener("click", logout);
  clearDataBtn.addEventListener("click", clearData);
  locationPermBtn.addEventListener("click", requestLocationPermission);
  cameraPermBtn.addEventListener("click", requestCameraPermission);
  motionPermBtn.addEventListener("click", requestMotionPermission);

  // Funções
  // Salvar perfil
  function saveProfile(e) {
    e.preventDefault();
    userProfile.name = nameInput.value;
    userProfile.age = ageInput.value;
    userProfile.weight = weightInput.value;
    userProfile.height = heightInput.value;
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    // Atualizar cabeçalho do perfil
    profileName.textContent = userProfile.name;
    alert("Perfil atualizado com sucesso!");
  }

  // Logout (simulado)
  function logout() {
    if (confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("userProfile");
      window.location.href = "index.html";
    }
  }

  // Limpar todos os dados
  function clearData() {
    if (
      confirm(
        "Tem certeza que deseja limpar todos os seus dados? Esta ação não pode ser desfeita."
      )
    ) {
      localStorage.removeItem("exercises");
      localStorage.removeItem("userProfile");
      alert("Todos os dados foram apagados com sucesso!");
      updateStatistics();
      initializeCharts();
    }
  }

  // Atualizar estatísticas
  function updateStatistics() {
    const totalExercises = exercises.length;
    const totalCalories = exercises.reduce(
      (sum, exercise) => sum + exercise.calories,
      0
    );
    const totalMinutes = exercises.reduce(
      (sum, exercise) => sum + exercise.duration,
      0
    );
    totalExercisesEl.textContent = totalExercises;
    totalCaloriesEl.textContent = totalCalories;
    totalMinutesEl.textContent = totalMinutes;
  }

  // Inicializar gráficos
  function initializeCharts() {
    // Preparar dados para o gráfico de tipos de exercício
    const exerciseTypes = {
      running: {
        label: "Corrida",
        count: 0,
        minutes: 0,
        calories: 0,
        color: "#0d6efd",
      },
      cycling: {
        label: "Ciclismo",
        count: 0,
        minutes: 0,
        calories: 0,
        color: "#20c997",
      },
      swimming: {
        label: "Natação",
        count: 0,
        minutes: 0,
        calories: 0,
        color: "#0dcaf0",
      },
      weights: {
        label: "Musculação",
        count: 0,
        minutes: 0,
        calories: 0,
        color: "#6f42c1",
      },
      yoga: {
        label: "Yoga",
        count: 0,
        minutes: 0,
        calories: 0,
        color: "#fd7e14",
      },
      other: {
        label: "Outro",
        count: 0,
        minutes: 0,
        calories: 0,
        color: "#6c757d",
      },
    };

    // Contabilizar exercícios por tipo
    exercises.forEach((exercise) => {
      const type = exercise.type;
      if (exerciseTypes[type]) {
        exerciseTypes[type].count++;
        exerciseTypes[type].minutes += exercise.duration;
        exerciseTypes[type].calories += exercise.calories;
      }
    });

    // Preparar dados para o gráfico
    const labels = [];
    const counts = [];
    const colors = [];
    for (const type in exerciseTypes) {
      if (exerciseTypes[type].count > 0) {
        labels.push(exerciseTypes[type].label);
        counts.push(exerciseTypes[type].count);
        colors.push(exerciseTypes[type].color);
      }
    }

    // Criar gráfico
    const ctx = document.getElementById("exerciseTypeChart").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });
  }

  // Funções para solicitar permissões
  function requestLocationPermission() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          locationPermBtn.classList.remove("btn-outline-primary");
          locationPermBtn.classList.add("btn-success");
          locationPermBtn.innerHTML =
            '<i class="fas fa-check me-1"></i> Localização';
          alert("Permissão de localização concedida!");
        },
        function (error) {
          alert(
            "Não foi possível obter permissão de localização: " + error.message
          );
        }
      );
    } else {
      alert("Geolocalização não é suportada pelo seu navegador.");
    }
  }

  function requestCameraPermission() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
          // Parar o stream após obter permissão
          stream.getTracks().forEach((track) => track.stop());
          cameraPermBtn.classList.remove("btn-outline-primary");
          cameraPermBtn.classList.add("btn-success");
          cameraPermBtn.innerHTML = '<i class="fas fa-check me-1"></i> Câmera';
          alert("Permissão de câmera concedida!");
        })
        .catch(function (error) {
          alert("Não foi possível obter permissão de câmera: " + error.message);
        });
    } else {
      alert("Acesso à câmera não é suportado pelo seu navegador.");
    }
  }

  function requestMotionPermission() {
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      // iOS 13+ requer permissão explícita
      DeviceMotionEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            motionPermBtn.classList.remove("btn-outline-primary");
            motionPermBtn.classList.add("btn-success");
            motionPermBtn.innerHTML =
              '<i class="fas fa-check me-1"></i> Sensores de Movimento';
            alert("Permissão de sensores de movimento concedida!");
          } else {
            alert("Permissão para sensores de movimento negada.");
          }
        })
        .catch(console.error);
    } else {
      // Para navegadores que não exigem permissão explícita
      motionPermBtn.classList.remove("btn-outline-primary");
      motionPermBtn.classList.add("btn-success");
      motionPermBtn.innerHTML =
        '<i class="fas fa-check me-1"></i> Sensores de Movimento';
      alert(
        "Permissão de sensores de movimento concedida ou não é necessária no seu dispositivo."
      );
    }
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registrado com sucesso:", registration);
      })
      .catch((error) => {
        console.error("Falha ao registrar o Service Worker:", error);
      });
  });
}
document
  .getElementById("darkModeSwitch")
  .addEventListener("change", function () {
    console.log("Modo escuro ativado/desativado");
    document.body.classList.toggle("dark-mode");
  });
console.log(
  "Gráfico inicializado:",
  document.getElementById("exerciseTypeChart")
);
