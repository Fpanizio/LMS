const BASE_URL = '/api';

const esc = (v) =>
  String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const secToMin = (seconds) => {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(Math.floor(seconds % 60)).padStart(2, '0');
  return `${mm}:${ss}`;
};

function showConfirmModal(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('modal-confirm');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const btnCancel = document.getElementById('modal-cancel');
    const btnConfirm = document.getElementById('modal-confirm-btn');

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.remove('hidden');

    const cleanup = () => {
      modal.classList.add('hidden');
      btnCancel.removeEventListener('click', handleCancel);
      btnConfirm.removeEventListener('click', handleConfirm);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    btnCancel.addEventListener('click', handleCancel);
    btnConfirm.addEventListener('click', handleConfirm);
  });
}

const routes = document.querySelectorAll('section[data-role]');
const navs = document.querySelectorAll('nav[data-role]');

function handleUserNav(user) {
  navs.forEach((nav) => {
    nav.classList.toggle('ativo', nav.dataset.role === user);
  });
}

let user;
let userName;
async function getUser() {
  user = 'public';
  try {
    const response = await fetch(`${BASE_URL}/auth/session`);
    const body = await response.json();
    if (!response.ok) throw new Error();
    user = body.role;
    userName = body.name;
    return user;
  } catch {
    return user;
  } finally {
    handleUserNav(user);
  }
}

async function router() {
  if (user === undefined) user = await getUser();
  const r = location.hash.replace('#', '').split('/').filter(Boolean).shift();
  const route = document.getElementById(r);
  routes.forEach((item) => item.classList.remove('ativo'));

  document.querySelectorAll('nav a').forEach((link) => {
    link.classList.remove('active');
    const linkRoute = link.getAttribute('href')?.replace('#/', '');
    if (linkRoute === r) link.classList.add('active');
  });

  if (route) {
    const role = route.dataset.role;
    const hasAccess = user === role || (user === 'admin' && role === 'user');
    if (!hasAccess) location.hash = '/login';
    route.classList.add('ativo');
    if (typeof data[r] === 'function') data[r](route);
  } else {
    if (typeof data[r] === 'function') data[r]();
  }
}

window.addEventListener('DOMContentLoaded', router);
window.addEventListener('hashchange', router);

async function getData(url, callback, onError) {
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) {
    if (onError) onError(body, response);
    return;
  }
  callback(body, response);
}

function renderResetCourseButton(courseId) {
  setTimeout(() => {
    sendForm('DELETE', `${BASE_URL}/lms/course/reset`, 'resetar-curso', () =>
      location.reload()
    );
  }, 50);

  return `
    <div id="resetar-curso">
      <form>
        <input name="courseId" type="hidden" value="${esc(courseId)}">
        <button type="submit">Resetar Progresso</button>
      </form>
    </div>
  `;
}

function renderCompleteButton(courseId, lessonId) {
  setTimeout(() => {
    sendForm('POST', `${BASE_URL}/lms/lesson/completed`, 'completar', () => {
      document.getElementById('completar').innerHTML = '<span></span>';
    });
  }, 50);

  return `
    <div id="completar">
      <form>
        <input name="courseId" type="hidden" value="${esc(courseId)}">
        <input name="lessonId" type="hidden" value="${esc(lessonId)}">
        <button type="submit" class="btn btn-primary">Completar</button>
      </form>
    </div>
  `;
}

const data = {
  cursos: (route) => {
    getData(`${BASE_URL}/lms/courses`, (courses) => {
      const render = route.querySelector('.render');

      const renderCourses = (completedCourseIds = []) => {
        render.innerHTML = courses
          .map((course) => {
            const isCompleted = completedCourseIds.includes(course.id);
            return `
          <div class="course-card">
            <div class="course-header-row">
              <h3>${esc(course.title)}</h3>
              <span class="status-dot ${isCompleted ? 'complete' : ''}"></span>
            </div>
            <p>${esc(course.description)}</p>
            <div class="course-meta">
              <span>📚 ${esc(course.lessons)} aulas</span>
              <span>⏱️ ${esc(course.hours)}h</span>
            </div>
            <a class="btn" href="#/curso/${esc(course.slug)}">Acessar Curso</a>
          </div>
        `;
          })
          .join('');
      };

      getData(
        `${BASE_URL}/lms/certificates`,
        (certs) => {
          const completedIds = Array.isArray(certs)
            ? certs.map((c) => c.course_id)
            : [];
          renderCourses(completedIds);
        },
        () => renderCourses([])
      );
    });
  },

  curso: (route) => {
    const [_, curso] = location.hash
      .replace('#', '')
      .split('/')
      .filter(Boolean);
    if (!curso) return;

    getData(`${BASE_URL}/lms/course/${curso}`, ({ course, lessons, completed }) => {
      const render = route.querySelector('.render');
      render.innerHTML = `
        <div class="course-header">
          <h2>${esc(course.title)}</h2>
          <p>${esc(course.description)}</p>
          <div class="course-meta" style="justify-content: center;">
            <span>📚 ${esc(course.lessons)} aulas</span>
            <span>⏱️ ${esc(course.hours)}h</span>
          </div>
        </div>
        <ul class="lessons-list">
          ${lessons
            .map((lesson) => {
              const isCompleted = completed.some(
                (x) => x.lesson_id == lesson.id
              );
              return `
              <li>
                <a href="#/aula/${esc(course.slug)}/${esc(lesson.slug)}">
                  ${esc(lesson.title)}
                  <span class="lesson-info">
                    <span>${secToMin(lesson.seconds)}</span>
                    <span class="status-dot ${
                      isCompleted ? 'complete' : ''
                    }"></span>
                  </span>
                </a>
              </li>
            `;
            })
            .join('')}
        </ul>
        ${completed.length > 0 ? renderResetCourseButton(course.id) : ''}
      `;
    });
  },

  aula: (route) => {
    const [_, curso, aula] = location.hash
      .replace('#', '')
      .split('/')
      .filter(Boolean);
    if (!curso || !aula) return;

    getData(`${BASE_URL}/lms/lesson/${curso}/${aula}`, (lesson) => {
      const render = route.querySelector('.render');
      render.innerHTML = `
        <div class="lesson-view">
          <h2>${esc(lesson.title)}</h2>
          <div class="breadcrumb">
            <a href="#/cursos">Cursos</a> /
            <a href="#/curso/${curso}">${curso}</a>
          </div>
          <div class="video-container">
            <video preload="metadata" src="/${lesson.video}" controls></video>
          </div>
          <nav class="lesson-nav" style="display: flex; gap: 1rem; justify-content: space-between; align-items: center;">
            ${
              lesson.prev
                ? `<div style="max-width: 200px;"> <a class="btn" href="#/aula/${curso}/${lesson.prev}">← Anterior</a></div>`
                : '<span></span>'
            }
            ${
              lesson.completed
                ? '<span></span>'
                : renderCompleteButton(lesson.course_id, lesson.id)
            }
            ${
              lesson.next
                ? `<div style="max-width: 200px;"> <a class="btn" href="#/aula/${curso}/${lesson.next}">Próxima →</a></div>`
                : '<span></span>'
            }
          </nav>
        </div>
      `;
    });
  },

  certificados: (route) => {
    getData(`${BASE_URL}/lms/certificates`, (certificates) => {
      if (!Array.isArray(certificates)) return;
      const render = route.querySelector('.render');
      render.innerHTML = `
        <ul class="certificates-list">
          ${certificates
            .map(
              (cert) => `
            <li>
              <a class="btn" target="_blank" href="${BASE_URL}/lms/certificate/${cert.id}">
                ${esc(cert.title)}
                <span>${cert.completed
                  .slice(0, 10)
                  .split('-')
                  .reverse()
                  .join('/')}</span>
              </a>
            </li>
          `
            )
            .join('')}
        </ul>
      `;
    });
  },

  sair: async () => {
    await fetch(`${BASE_URL}/auth/logout`, { method: 'DELETE' });
    user = 'public';
    location.hash = '/login';
    handleUserNav(user);
  },

  resetar: () => {
    const query = location.hash.split('=');
    if (query[1]) {
      const token = document.querySelector('input[name="token"]');
      if (token) token.value = query[1];
    }
  },

  perfil: (route) => {
    const profileName = route.querySelector('#profile-name');
    if (profileName) profileName.textContent = userName || 'Usuário';

    // Evita adicionar listeners duplicados
    if (route.dataset.init) return;
    route.dataset.init = 'true';

    // Form: Alterar Email
    const formEmail = route.querySelector('#form-email');
    const oldEmailField = formEmail
      ?.querySelector('#old-email')
      ?.closest('.field');
    const newEmailField = formEmail
      ?.querySelector('#new-email')
      ?.closest('.field');

    formEmail?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formEmail);
      const badge = document.createElement('div');
      let errorTitle = '';

      try {
        const response = await fetch(`${BASE_URL}/auth/email/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(formData)),
        });
        const body = await response.json();
        errorTitle = body?.title || '';
        if (!response.ok) throw new Error(body?.title || 'Erro');
        badge.textContent = 'Email alterado! Redirecionando...';
        badge.className = 'ok';
        formEmail.reset();
        showFieldError(oldEmailField, false);
        showFieldError(newEmailField, false);
        // Redireciona para login após 1.5s (sessão invalidada)
        setTimeout(() => {
          user = 'public';
          handleUserNav(user);
          location.hash = '/login';
        }, 1500);
      } catch (err) {
        badge.textContent = err.message || 'Erro';
        badge.className = 'fail';
        // Erros do email antigo
        if (
          errorTitle === 'Old email not found' ||
          errorTitle === 'invalid email'
        ) {
          showFieldError(oldEmailField, true);
        }
        // Erros do email novo
        if (
          errorTitle === 'New email already exists' ||
          errorTitle === 'invalid email'
        ) {
          showFieldError(newEmailField, true);
        }
      } finally {
        formEmail.appendChild(badge);
        setTimeout(() => badge.remove(), 2000);
      }
    });

    // Form: Alterar Senha
    const formPassword = route.querySelector('#form-password');
    const newPasswordField = formPassword
      ?.querySelector('#new-password')
      ?.closest('.field');

    formPassword?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formPassword);
      const badge = document.createElement('div');
      let status = 0;

      try {
        const response = await fetch(`${BASE_URL}/auth/password/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(formData)),
        });
        status = response.status;
        const body = await response.json();
        if (!response.ok) throw new Error(body?.title || 'Erro');

        badge.textContent = 'Senha alterada!';
        badge.className = 'ok';
        formPassword.reset();
        newPasswordField?.classList.remove('error');
      } catch (err) {
        badge.textContent = err.message || 'Erro';
        badge.className = 'fail';
        if (err.message === 'invalid password' || status === 422) {
          newPasswordField?.classList.add('error');
          setTimeout(() => newPasswordField?.classList.remove('error'), 3000);
        }
      } finally {
        formPassword.appendChild(badge);
        setTimeout(() => badge.remove(), 2000);
      }
    });
  },

  ['criar-curso']: (route) => {
    getData(`${BASE_URL}/lms/courses`, (courses) => {
      const render = route.querySelector('.render');
      const form = route.querySelector('form');
      const formActions = form.querySelector('.form-actions');
      let selectedCourse = null;

      const select = document.createElement('select');
      select.innerHTML = '<option value="">+ Novo curso</option>';
      courses.forEach((course, i) => {
        select.innerHTML += `<option value="${i}">${course.slug}</option>`;
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-delete hidden';
      deleteBtn.innerHTML =
        '<icon-trash class="icon-trash"></icon-trash> Excluir';

      select.addEventListener('change', () => {
        if (select.value === '') {
          selectedCourse = null;
          form.reset();
          deleteBtn.classList.add('hidden');
        } else {
          selectedCourse = courses[select.value];
          Object.keys(selectedCourse).forEach((key) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = selectedCourse[key];
          });
          deleteBtn.classList.remove('hidden');
        }
      });

      deleteBtn.addEventListener('click', async () => {
        if (!selectedCourse) return;

        const confirmed = await showConfirmModal(
          'Excluir Curso',
          `Deseja realmente excluir o curso "${selectedCourse.slug}"?`
        );
        if (!confirmed) return;

        try {
          const response = await fetch(
            `${BASE_URL}/lms/course/delete/${selectedCourse.id}`,
            {
              method: 'DELETE',
            }
          );
          const body = await response.json();
          if (!response.ok) throw new Error(body?.title || 'Erro');
          location.reload();
        } catch (err) {
          alert(err.message || 'Erro ao deletar curso');
        }
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const badge = document.createElement('div');

        try {
          const isUpdate = selectedCourse !== null;
          const url = isUpdate
            ? `${BASE_URL}/lms/course/${selectedCourse.slug}`
            : `${BASE_URL}/lms/course`;
          const method = isUpdate ? 'PUT' : 'POST';

          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(formData)),
          });

          const body = await response.json();
          if (!response.ok) throw new Error(body?.title || 'Erro');

          badge.textContent = isUpdate ? 'Curso atualizado!' : 'Curso criado!';
          badge.className = 'ok';
          location.reload();
        } catch (err) {
          badge.textContent = err.message || 'Erro';
          badge.className = 'fail';
        } finally {
          form.appendChild(badge);
          setTimeout(() => badge.remove(), 2000);
        }
      });

      render.innerHTML = '';
      render.appendChild(select);
      formActions.insertBefore(deleteBtn, formActions.firstChild);
    });
  },

  ['criar-aula']: (route) => {
    const render = route.querySelector('.render');
    const form = route.querySelector('form');
    const courseSelect = form.querySelector('#course-slug');
    const formActions = form.querySelector('.form-actions');
    let selectedLesson = null;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete hidden';
    deleteBtn.innerHTML =
      '<icon-trash class="icon-trash"></icon-trash> Excluir';
    formActions.insertBefore(deleteBtn, formActions.firstChild);

    // Buscar cursos para popular o select
    getData(`${BASE_URL}/lms/courses`, (courses) => {
      courseSelect.innerHTML = '<option value="">Selecione o curso...</option>';
      courses.forEach((course) => {
        courseSelect.innerHTML += `<option value="${esc(course.slug)}">${esc(
          course.title
        )}</option>`;
      });
    });

    // Buscar aulas para o select de edição
    getData(`${BASE_URL}/lms/lessons`, (lessons) => {
      const select = document.createElement('select');
      select.innerHTML = '<option value="">+ Nova aula</option>';
      lessons.forEach((lesson, i) => {
        select.innerHTML += `<option value="${i}">${esc(
          lesson.courseSlug
        )} - ${esc(lesson.slug)}</option>`;
      });

      select.addEventListener('change', () => {
        if (select.value === '') {
          selectedLesson = null;
          form.reset();
          deleteBtn.classList.add('hidden');
          // Restaurar opções do select de cursos
          courseSelect.innerHTML =
            '<option value="">Selecione o curso...</option>';
          getData(`${BASE_URL}/lms/courses`, (courses) => {
            courses.forEach((course) => {
              courseSelect.innerHTML += `<option value="${esc(
                course.slug
              )}">${esc(course.title)}</option>`;
            });
          });
        } else {
          selectedLesson = lessons[select.value];
          Object.keys(selectedLesson).forEach((key) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = selectedLesson[key];
          });
          deleteBtn.classList.remove('hidden');
        }
      });

      deleteBtn.addEventListener('click', async () => {
        if (!selectedLesson) return;

        const confirmed = await showConfirmModal(
          'Excluir Aula',
          `Deseja realmente excluir a aula "${selectedLesson.slug}"?`
        );
        if (!confirmed) return;

        try {
          const response = await fetch(
            `${BASE_URL}/lms/lesson/delete/${selectedLesson.id}`,
            {
              method: 'DELETE',
            }
          );
          const body = await response.json();
          if (!response.ok) throw new Error(body?.title || 'Erro');
          location.reload();
        } catch (err) {
          alert(err.message || 'Erro ao deletar aula');
        }
      });

      render.innerHTML = '';
      render.appendChild(select);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const badge = document.createElement('div');

      try {
        const input = form.querySelector('input[type="file"]');
        const files = input?.files;
        const formData = new FormData(form);

        if (files?.length > 0) {
          const res = await fetch(`${BASE_URL}/files/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
              'x-filename': files[0].name,
              'x-visibility': formData.get('free') === '1' ? 'public' : 'private',
            },
            body: files[0],
          });
          if (!res.ok) throw new Error();
          const upload = await res.json();
          formData.set('video', upload.path);
        }

        const isUpdate = selectedLesson !== null;
        const url = isUpdate
          ? `${BASE_URL}/lms/lesson/${selectedLesson.id}`
          : `${BASE_URL}/lms/lesson`;
        const method = isUpdate ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(formData)),
        });

        const body = await response.json();
        if (!response.ok) throw new Error(body?.title || 'Erro');

        badge.textContent = isUpdate ? 'Aula atualizada!' : 'Aula criada!';
        badge.className = 'ok';
        location.reload();
      } catch (err) {
        badge.textContent = err.message || 'Erro';
        badge.className = 'fail';
      } finally {
        form.appendChild(badge);
        setTimeout(() => badge.remove(), 2000);
      }
    });
  },

  usuarios: (route) => {
    const render = route.querySelector('.render');
    const form = document.querySelector('#usuarios form');

    const fetchUsers = () => {
      const formData = new FormData(form);
      const s = formData.get('s') || '';
      const page = formData.get('page') || 1;
      getData(
        `${BASE_URL}/auth/users/search?s=${s}&page=${page}`,
        (users, response) => {
          const total = Number(response.headers.get('x-total-count'));
          renderUsers(users, total, render, form);
        }
      );
    };

    fetchUsers();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      fetchUsers();
    });
  },
};

function renderUsers(users, total, render, form) {
  const totalPages = Math.ceil(total / 5);
  const pageInput = document.getElementById('page');

  let html = `<ul class="users-list">
    ${users
      .map(
        (user) => `
      <li>
        <span>${esc(user.name)}</span>
        <span>${esc(user.email)}</span>
        <span>
          <icon-trash class="icon-trash" data-email="${esc(
            user.email
          )}"></icon-trash>
        </span>
      </li>
    `
      )
      .join('')}
  </ul>`;

  if (totalPages > 1) {
    html += '<nav id="pages">';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button type="button" data-page="${i}">${i}</button>`;
    }
    html += '</nav>';
  }

  render.innerHTML = html;

  render.querySelectorAll('#pages button').forEach((btn) => {
    btn.addEventListener('click', () => {
      pageInput.value = btn.dataset.page;
      form.requestSubmit();
    });
  });

  // Handler para deletar usuário
  render.querySelectorAll('.icon-trash').forEach((icon) => {
    icon.addEventListener('click', async () => {
      const email = icon.dataset.email;

      const confirmed = await showConfirmModal(
        'Excluir Usuário',
        `Deseja realmente excluir o usuário ${email}?`
      );
      if (!confirmed) return;

      try {
        const response = await fetch(`${BASE_URL}/auth/user/delete/${email}`, {
          method: 'DELETE',
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body?.title || 'Erro');
        form.requestSubmit(); // Recarrega a lista
      } catch (err) {
        alert(err.message || 'Erro ao deletar usuário');
      }
    });
  });
}

// Form Handler
function showFieldError(field, show = true) {
  if (!field) return;
  field.classList.toggle('error', show);
  if (show) {
    setTimeout(() => field.classList.remove('error'), 3000);
  }
}

function showPasswordError(form, show = true) {
  const passwordField = form
    .querySelector('input[type="password"]')
    ?.closest('.field');
  showFieldError(passwordField, show);
}

function showEmailError(form, show = true) {
  const emailField = form
    .querySelector('input[type="email"]')
    ?.closest('.field');
  showFieldError(emailField, show);
}

async function sendForm(method, url, id, callback) {
  const form = document.querySelector('#' + id + ' form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    let response,
      body = {};
    const badge = document.createElement('div');

    try {
      response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      body = await response.json();
      if (!response.ok) throw new Error();
      if (typeof callback === 'function') callback(response, body);
      badge.textContent = 'Sucesso!';
      badge.className = 'ok';
      showPasswordError(form, false);
      showEmailError(form, false);
    } catch {
      badge.textContent = body?.title || 'Erro';
      badge.className = 'fail';
      // Erros de senha
      if (body?.title === 'invalid password' || response?.status === 422) {
        showPasswordError(form, true);
      }
      // Erros de email/login
      if (
        body?.title === 'invalid email' ||
        body?.title === 'User not found, please check your email and password'
      ) {
        showEmailError(form, true);
      }
    } finally {
      form.appendChild(badge);
      setTimeout(() => badge.remove(), 2000);
    }
  });
}

sendForm('POST', `${BASE_URL}/auth/login`, 'login', async () => {
  user = await getUser();
  location.hash = user === 'admin' ? '/criar-curso' : '/cursos';
});

sendForm('POST', `${BASE_URL}/auth/user`, 'criar-conta', () => {
  location.hash = '/login';
});

sendForm('PUT', `${BASE_URL}/auth/password/forgot`, 'perdeu');
sendForm('POST', `${BASE_URL}/auth/password/reset`, 'resetar');

// Debug Quick Login
document.querySelectorAll('.btn-debug').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const email = btn.dataset.email;
    const pass = btn.dataset.pass;
    document.getElementById('email').value = email;
    document.getElementById('password').value = pass;
    document.querySelector('#login form').requestSubmit();
  });
});

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersDark ? 'dark' : 'light'));
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

initTheme();
