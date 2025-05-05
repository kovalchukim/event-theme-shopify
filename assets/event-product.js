document.addEventListener('DOMContentLoaded', () => {
  const optionGroups = document.querySelectorAll('.event-options');
  const variantData = JSON.parse(document.querySelector('.event-options-block').dataset.variants);
  const selectedOptions = {};
  const buyButton = document.getElementById('buy-now');

  const updateOptionStates = () => {
    optionGroups.forEach(group => {
      const optionIndex = group.dataset.optionIndex;

      if (optionIndex === "0") return;

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
        } else {
          optionEl.classList.add('disabled');
        }
      });
    });

    updateBuyButton();
    updatePrice();
  };

  const updatePrice = () => {
    const selectedCount = Object.keys(selectedOptions).length;
    const totalOptions = optionGroups.length;
    const priceEl = document.getElementById('product-price');

    let match;

    if (selectedCount === totalOptions) {
      match = variantData.find(variant => {
        return variant.available && variant.options.every((optValue, i) => {
          return selectedOptions[i] === optValue;
        });
      });
    }

    if (match) {
      priceEl.textContent = (match.price / 100).toFixed(2) + ' ' + Shopify.currency.active;
    } else {
      // Якщо повністю не вибрано — показати мінімальну ціну
      const cheapest = variantData
        .filter(v => v.available)
        .sort((a, b) => a.price - b.price)[0];

      if (cheapest) {
        priceEl.textContent = (cheapest.price / 100).toFixed(2) + ' ' + Shopify.currency.active;
      }
    }
  };

  const updateBuyButton = () => {
    const selectedCount = Object.keys(selectedOptions).length;
    const totalOptions = optionGroups.length;

    if (selectedCount < totalOptions) {
      buyButton.disabled = true;
      return;
    }

    const match = variantData.find(variant => {
      return variant.available && variant.options.every((optValue, i) => {
        return selectedOptions[i] === optValue;
      });
    });

    buyButton.disabled = !match;
  };
  const handleSelect = (el) => {
    if (!el) return;

    const value = el.dataset.value;
    const index = el.closest('.event-options').dataset.optionIndex;

    const container = document.querySelector(`.event-options[data-option-index="${index}"]`);
    if (!container) return;

    if (index === "0") {
      Object.keys(selectedOptions).forEach(i => {
        if (i !== "0") delete selectedOptions[i];
      });

      document.querySelectorAll('.event-options').forEach(group => {
        if (group.dataset.optionIndex !== "0") {
          group.querySelectorAll('.event-option').forEach(opt => {
            opt.classList.remove('selected');
            opt.setAttribute('aria-pressed', 'false');
          });
        }
      });
    }

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
  updatePrice();
});
