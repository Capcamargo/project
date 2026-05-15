const draftKey = 'giftmatch_signup_draft';
const toast = document.getElementById('toast');
const form = document.getElementById('registerForm');

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 2800);
}

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(draftKey)) ?? null;
  } catch {
    return null;
  }
}

function clearDraft() {
  localStorage.removeItem(draftKey);
}

async function hydrateFromSession() {
  const session = await window.giftmatchSupabase.getSession();
  if (!session?.user) return;

  const user = session.user;
  document.getElementById('registerName').value = user.user_metadata?.full_name ?? user.user_metadata?.name ?? '';
  document.getElementById('registerEmail').value = user.email ?? '';
}

const draft = readDraft();
if (draft) {
  document.getElementById('registerName').value = draft.name ?? '';
  document.getElementById('registerEmail').value = draft.email ?? '';
}

hydrateFromSession().catch(() => {});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const consent = document.getElementById('registerConsent').checked;

  if (!name || !email) {
    showToast('Заполните имя и email.');
    return;
  }

  if (!consent) {
    showToast('Нужно согласиться с условиями.');
    return;
  }

  try {
    clearDraft();
    writeDraft({ name, email });
    const { error } = await window.giftmatchSupabase.supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: name,
          name,
        },
      },
    });

    if (error) throw error;

    showToast('Мы отправили magic link на вашу почту. Откройте письмо, чтобы войти в GiftMatch.');
  } catch (error) {
    showToast(error.message || 'Не удалось отправить magic link.');
  }
});

function writeDraft(value) {
  localStorage.setItem(draftKey, JSON.stringify(value));
}
