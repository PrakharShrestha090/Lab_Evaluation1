document.addEventListener("DOMContentLoaded", function () {
  // LOGIN LOGIC - Call Backend API
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.onsubmit = async function (e) {
      e.preventDefault();
      const email = loginForm.loginEmail.value.trim();
      const password = loginForm.loginPassword.value.trim();
      const errorDiv = document.getElementById("loginError");

      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store user info in localStorage
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          errorDiv.classList.add("hidden");
          window.location.href = "home.html";
        } else {
          errorDiv.innerText = data.error;
          errorDiv.classList.remove("hidden");
        }
      } catch (error) {
        errorDiv.innerText = "Connection error. Please try again.";
        errorDiv.classList.remove("hidden");
      }
    };
  }

  // REGISTER LOGIC - Call Backend API
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.onsubmit = async function (e) {
      e.preventDefault();
      const registerMsg = document.getElementById("registerMsg");

      const userData = {
        name: registerForm.regName.value.trim(),
        email: registerForm.regEmail.value.trim(),
        password: registerForm.regPassword.value.trim(),
        course: registerForm.regCourse.value.trim(),
        contact: registerForm.regContact.value.trim(),
      };

      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          registerMsg.innerText = "Registration successful! Redirecting...";
          registerMsg.classList.remove("hidden");
          setTimeout(() => {
            window.location.href = "home.html";
          }, 1500);
        } else {
          alert(data.error || "Registration failed");
        }
      } catch (error) {
        alert("Connection error. Please try again.");
      }
    };
  }

  // LOGOUT LOGIC
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.replace("index.html");
    };
  }

  // HOMEPAGE Welcome - Display logged in user's name
  const userName = document.getElementById("userName");
  if (userName) {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      window.location.replace("index.html");
      return;
    }
    userName.innerText = user.name || "Student";
  }

  // STUDENTS LIST PAGE - Fetch from Backend
  const studentsList = document.getElementById("studentsList");
  if (studentsList) {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      window.location.replace("index.html");
      return;
    }

    async function loadStudents() {
      try {
        const response = await fetch("/api/students");
        const students = await response.json();
        renderStudents(students);

        // Store for search
        window.allStudents = students;
      } catch (error) {
        studentsList.innerHTML = `<div class="text-red-500">Error loading students</div>`;
      }
    }

    function renderStudents(list) {
      if (list.length === 0) {
        studentsList.innerHTML = `<div class="text-gray-500 text-center col-span-full">No students registered yet.</div>`;
        return;
      }
      studentsList.innerHTML = list
        .map(
          (u) =>
            `<div class="bg-white p-4 rounded shadow flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-lg transition">
          <div class="mb-2 sm:mb-0">
            <div class="font-bold text-lg text-blue-700">${u.name}</div>
            <div class="text-sm text-gray-600">${u.email}</div>
            <div class="text-sm text-gray-500">Course: ${u.course}</div>
          </div>
          <div class="text-xs text-gray-400">${u.contact}</div>
        </div>`
        )
        .join("");
    }

    loadStudents();

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        let val = searchInput.value.toLowerCase();
        if (window.allStudents) {
          renderStudents(
            window.allStudents.filter(
              (u) =>
                u.name.toLowerCase().includes(val) ||
                u.email.toLowerCase().includes(val) ||
                u.course.toLowerCase().includes(val)
            )
          );
        }
      });
    }
  }

  // PROFILE PAGE - Get from localStorage (user info stored after login)
  const profileContent = document.getElementById("profileContent");
  if (profileContent) {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      window.location.replace("index.html");
      return;
    }

    profileContent.innerHTML = `
      <div class="space-y-3">
        <div class="flex justify-between border-b pb-2">
          <strong class="text-gray-700">Name:</strong>
          <span class="text-gray-900">${user.name}</span>
        </div>
        <div class="flex justify-between border-b pb-2">
          <strong class="text-gray-700">Email:</strong>
          <span class="text-gray-900">${user.email}</span>
        </div>
        <div class="flex justify-between border-b pb-2">
          <strong class="text-gray-700">Course:</strong>
          <span class="text-gray-900">${user.course}</span>
        </div>
        <div class="flex justify-between border-b pb-2">
          <strong class="text-gray-700">Contact:</strong>
          <span class="text-gray-900">${user.contact}</span>
        </div>
      </div>
    `;
  }
});
