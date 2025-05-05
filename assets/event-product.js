document.addEventListener('DOMContentLoaded', () => {
  const optionGroups = document.querySelectorAll('.event-options');
  const variantData = JSON.parse(document.querySelector('.event-options-block').dataset.variants);
  const selectedOptions = {};

  const updateOptionStates = () => {
    optionGroups.forEach(group => {
      const optionIndex = group.dataset.optionIndex;

      group.querySelectorAll('.event-option').forEach(optionEl => {
        const value = optionEl.dataset.value;
        const tempSelection = { ...selectedOptions, [optionIndex]: value };

        const match = variantData.find(variant => {
          return variant.available && variant.options.every((optValue, i) => {
            return !tempSelection[i] || tempSelection[i] === optValue;
          });
        });

        if (match) {
          optionEl.classList.remove('disabled');
          optionEl.setAttribute('aria-disabled', 'false');
          optionEl.setAttribute('tabindex', '0');
        } else {
          optionEl.classList.add('disabled');
          optionEl.setAttribute('aria-disabled', 'true');
          optionEl.setAttribute('tabindex', '-1');
        }
      });
    });
  };

  const handleSelect = (el) => {
    if (!el || el.classList.contains('disabled')) return;

    const value = el.dataset.value;
    const index = el.closest('.event-options').dataset.optionIndex;

    const container = document.querySelector(`.event-options[data-option-index="${index}"]`);
    if (!container) return;

    container.querySelectorAll('.event-option').forEach(opt => {
      opt.classList.remove('selected');
      opt.setAttribute('aria-pressed', 'false');
    });

    el.classList.add('selected');
    el.setAttribute('aria-pressed', 'true');
    selectedOptions[index] = value;

    updateOptionStates();
  };

  optionGroups.forEach(group => {
    group.addEventListener('click', e => {
      const el = e.target.closest('.event-option');
      if (el) handleSelect(el);
    });

    group.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('event-option')) {
        e.preventDefault();
        handleSelect(e.target);
      }
    });
  });

  updateOptionStates();
});
