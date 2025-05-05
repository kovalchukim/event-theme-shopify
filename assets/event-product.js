document.addEventListener('DOMContentLoaded', () => {
  const variantGroups = document.querySelectorAll('.variant-group');
  const variantData = JSON.parse(document.querySelector('.product-variants')?.dataset.variants || '[]');
  const selectedOptions = {};
  const buyNowButton = document.getElementById('buy-now-button');
  const priceElement = document.querySelector('.product-price');

  if (!variantGroups.length || !variantData.length || !buyNowButton || !priceElement) return;

  const updateDisabledOptions = () => {
    variantGroups.forEach(group => {
      const optionIndex = group.dataset.optionIndex;

      if (optionIndex === '0') return;

      group.querySelectorAll('.variant-option').forEach(optionEl => {
        const optionValue = optionEl.dataset.value;
        const tempSelection = { ...selectedOptions, [optionIndex]: optionValue };

        const isMatch = variantData.some(variant =>
            variant.available && variant.options.every((val, i) =>
              !tempSelection[i] || tempSelection[i] === val
            )
        );

        optionEl.classList.toggle('disabled', !isMatch);
        optionEl.disabled = !isMatch;
      });
    });
  };

  const updateProductPrice = () => {
    const selectedCount = Object.keys(selectedOptions).length;
    const totalOptions = variantGroups.length;

    let matchingVariant = null;

    if (selectedCount === totalOptions) {
      matchingVariant = variantData.find(variant =>
        variant.available && variant.options.every((val, i) => selectedOptions[i] === val)
      );
    }

    if (matchingVariant) {
      priceElement.textContent = formatMoney(matchingVariant.price);
    } else {
      const cheapestVariant = variantData
        .filter(variant => variant.available)
        .sort((a, b) => a.price - b.price)[0];

      if (cheapestVariant) {
        priceElement.textContent = formatMoney(cheapestVariant.price);
      }
    }
  };

  const formatMoney = (cents) => {
    return (cents / 100).toFixed(2) + ' ' + (Shopify?.currency?.active || 'UAH');
  };

  const updateBuyNowButtonState = () => {
    const selectedCount = Object.keys(selectedOptions).length;
    const totalOptions = variantGroups.length;

    const matchingVariant = variantData.find(variant =>
      variant.available && variant.options.every((val, i) => selectedOptions[i] === val)
    );

    buyNowButton.disabled = !(matchingVariant && selectedCount === totalOptions);
  };

  const handleOptionSelect = (button) => {
    if (button.classList.contains('selected')) return;

    const group = button.closest('.variant-group');
    const optionIndex = group.dataset.optionIndex;
    const optionValue = button.dataset.value;

    group.querySelectorAll('.variant-option').forEach(opt => {
      opt.classList.remove('selected');
      opt.setAttribute('aria-pressed', 'false');
    });

    button.classList.add('selected');
    button.setAttribute('aria-pressed', 'true');
    selectedOptions[optionIndex] = optionValue;

    if (optionIndex === '0') {
      Object.keys(selectedOptions).forEach(index => {
        if (index !== '0') delete selectedOptions[index];
      });

      variantGroups.forEach(group => {
        if (group.dataset.optionIndex !== '0') {
          group.querySelectorAll('.variant-option').forEach(opt => {
            opt.classList.remove('selected');
            opt.setAttribute('aria-pressed', 'false');
          });
        }
      });
    }

    updateDisabledOptions();
    updateProductPrice();
    updateBuyNowButtonState();
  };

  variantGroups.forEach(group => {
    group.addEventListener('click', e => {
      const option = e.target.closest('.variant-option');
      if (option && !option.classList.contains('disabled')) {
        handleOptionSelect(option);
      }
    });

    group.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.variant-option:not(.disabled)')) {
        e.preventDefault();
        handleOptionSelect(e.target);
      }
    });
  });

  buyNowButton.addEventListener('click', () => {
    const matchingVariant = variantData.find(variant =>
      variant.available && variant.options.every((val, i) => selectedOptions[i] === val)
    );

    if (matchingVariant) {
      const quantity = 1;
      window.location.href = `/cart/${matchingVariant.id}:${quantity}`;
    }
  });

  updateDisabledOptions();
  updateProductPrice();
  updateBuyNowButtonState();
});
