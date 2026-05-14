const storageKey = 'giftmatch_exam_profile';
const toast = document.getElementById('toast');
const form = document.getElementById('registerForm');

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 2600);
}

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? null;
  } catch {
    return null;
  }
}

function writeProfile(profile) {
  localStorage.setItem(storageKey, JSON.stringify(profile));
}

const existingProfile = readProfile();
if (existingProfile) {
  document.getElementById('registerName').value = existingProfile.name ?? '';
  document.getElementById('registerEmail').value = existingProfile.email ?? '';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const repeat = document.getElementById('registerPasswordRepeat').value;
  const consent = document.getElementById('registerConsent').checked;

  if (!name || !email) {
    showToast('Заполните имя и email.');
    return;
  }

  if (password.length < 6) {
    showToast('Пароль должен быть не короче 6 символов.');
    return;
  }

  if (password !== repeat) {
    showToast('Пароли не совпадают.');
    return;
  }

  if (!consent) {
    showToast('Нужно согласиться с условиями.');
    return;
  }

  const previous = readProfile();
  writeProfile({
    email,
    name,
    paid: previous?.paid ?? false,
    plan: previous?.plan ?? 'Free',
  });

  showToast('Аккаунт создан. Перенаправляем обратно в GiftMatch.');
  window.setTimeout(() => {
    window.location.href = 'app.html';
  }, 900);
});
