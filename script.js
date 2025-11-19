document.addEventListener("DOMContentLoaded", function () {
  // LOGIN LOGIC
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.onsubmit = function (e) {
      e.preventDefault();
      const email = loginForm.loginEmail.value.trim();
      const password = loginForm.loginPassword.value.trim();
      let users = JSON.parse(localStorage.getItem("users") || "[]");
      let found = users.find((u) => u.email === email);
      const errorDiv = document.getElementById("loginError");
      if (!found) {
        errorDiv.innerText = "No account was found for this email.";
        errorDiv.classList.remove("hidden");
      } else if (found.password !== password) {
        errorDiv.innerText = "Incorrect password!";
        errorDiv.classList.remove("hidden");
      } else {
        errorDiv.classList.add("hidden");
        localStorage.setItem("currentUser", email);
        window.location.href = "home.html";
      }
    };
  }

  // REGISTER LOGIC
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.onsubmit = function (e) {
      e.preventDefault();
      const email = registerForm.regEmail.value.trim();
      let users = JSON.parse(localStorage.getItem("users") || "[]");

      // Check if email already exists
      let existing = users.find((u) => u.email === email);
      if (existing) {
        alert("This email is already registered. Please login.");
        return;
      }

      const newUser = {
        name: registerForm.regName.value.trim(),
        email: email,
        password: registerForm.regPassword.value.trim(),
        course: registerForm.regCourse.value.trim(),
        contact: registerForm.regContact.value.trim(),
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", newUser.email);
      document.getElementById("registerMsg").innerText =
        "Registration successful! Redirecting...";
      document.getElementById("registerMsg").classList.remove("hidden");
      setTimeout(() => {
        window.location.href = "home.html";
      }, 1500);
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
    const email = localStorage.getItem("currentUser");
    if (!email) {
      // If not logged in, redirect to login
      window.location.replace("index.html");
      return;
    }
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    let found = users.find((u) => u.email === email);
    userName.innerText = found?.name || "Student";
  }

  // STUDENTS LIST PAGE
  const studentsList = document.getElementById("studentsList");
  if (studentsList) {
    // Check if logged in
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      window.location.replace("index.html");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users") || "[]");

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

    renderStudents(users);

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        let val = searchInput.value.toLowerCase();
        renderStudents(
          users.filter(
            (u) =>
              u.name.toLowerCase().includes(val) ||
              u.email.toLowerCase().includes(val) ||
              u.course.toLowerCase().includes(val)
          )
        );
      });
    }
  }

  // PROFILE PAGE
  const profileContent = document.getElementById("profileContent");
  if (profileContent) {
    const email = localStorage.getItem("currentUser");
    if (!email) {
      window.location.replace("index.html");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users") || "[]");
    let user = users.find((u) => u.email === email);

    if (user) {
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
    } else {
      profileContent.innerHTML = `<div class="text-red-500">User information not found.</div>`;
    }
  }
});
