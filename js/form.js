/**
 * FORMULAIRE DE CONTACT — validation
 */
export function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successMsg = form.querySelector('.form__success');

  const validators = {
    name:        (v) => v.trim().length >= 2,
    company:     (_) => true,
    phone:       (v) => v.trim() === '' || /^[\d\s\+\-\(\)]{6,20}$/.test(v.trim()),
    email:       (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    project_type:(v) => v !== '',
    budget:      (_) => true,
    description: (v) => v.trim().length >= 10,
  };

  const errorMessages = {
    name:        'Veuillez entrer votre nom et prénom.',
    phone:       'Numéro de téléphone invalide.',
    email:       'Adresse email invalide.',
    project_type:'Veuillez sélectionner un type de projet.',
    description: 'La description doit contenir au moins 10 caractères.',
  };

  function validateField(input) {
    const name  = input.name;
    const group = input.closest('.form__group');
    if (!group) return true;

    const errEl  = group.querySelector('.form__error');
    const isValid = validators[name] ? validators[name](input.value) : true;

    group.classList.toggle('has-error', !isValid);
    input.classList.toggle('error', !isValid);
    if (errEl) errEl.textContent = errorMessages[name] || '';

    return isValid;
  }

  // Validate on blur
  form.querySelectorAll('input, select, textarea').forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isFormValid = true;
    form.querySelectorAll('input, select, textarea').forEach((input) => {
      if (!validateField(input)) isFormValid = false;
    });

    if (!isFormValid) return;

    const submitBtn = form.querySelector('.form__submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    // Simulate send (replace with actual backend/mailto)
    setTimeout(() => {
      form.style.display = 'none';
      if (successMsg) successMsg.classList.add('is-visible');
    }, 1200);
  });
}
