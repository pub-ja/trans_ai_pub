document.addEventListener('DOMContentLoaded', function () {
    // ===================================
    // Accordion Functionality
    // ===================================
    
    // 일반 아코디언 기능
    document.querySelectorAll('.kai-accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.closest('.kai-accordion-item');
            accordionItem.classList.toggle('-open');
            updateAccordionSwitchState();
        });
    });

    // 아코디언 폼 컨테이너 토글 기능
    document.querySelectorAll('.kai-form__container.-accordion .kai-form__top').forEach(header => {
        header.addEventListener('click', () => {
            const container = header.closest('.kai-form__container');
            container.classList.toggle('-open');
        });
    });

    // 전체 아코디언 열기/닫기 스위치
    const allAccordionSwitch = document.querySelector('.kai-switch[data-control="all-accordion"] input');
    if (allAccordionSwitch) {
        allAccordionSwitch.addEventListener('change', function () {
            const accordionItems = document.querySelectorAll('.kai-accordion-item');
            accordionItems.forEach(item => {
                item.classList.toggle('-open', this.checked);
            });
        });
    }

    // ===================================
    // Checkbox Functionality
    // ===================================

    // 체크박스 기능
    document.querySelectorAll('.kai-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const headerCheckbox = checkbox.closest('.kai-accordion-header')?.querySelector('.kai-checkbox input');
            const contentCheckbox = checkbox.closest('.kai-accordion-content')?.querySelector('.kai-checkbox input');

            if (headerCheckbox) {
                const contentCheckboxes = headerCheckbox
                    .closest('.kai-accordion-item')
                    .querySelectorAll('.kai-accordion-content .kai-checkbox input');
                contentCheckboxes.forEach(cb => (cb.checked = headerCheckbox.checked));
            }

            if (contentCheckbox) {
                const headerCheckbox = contentCheckbox
                    .closest('.kai-accordion-item')
                    .querySelector('.kai-accordion-header .kai-checkbox input');
                const allContentCheckboxes = contentCheckbox
                    .closest('.kai-accordion-item')
                    .querySelectorAll('.kai-accordion-content .kai-checkbox input');
                const allChecked = Array.from(allContentCheckboxes).every(cb => cb.checked);
                headerCheckbox.checked = allChecked;
            }

            updateToggleAllState();
        });
    });

    // 전체 선택 토글 버튼
    const toggleAll = document.querySelector('.kai-toggle-button[data-control="all-items"] input');
    if (toggleAll) {
        toggleAll.addEventListener('change', function () {
            const isChecked = this.checked;
            const toggleButton = this.closest('.kai-toggle-button');
            toggleButton.classList.remove('is-active');
            toggleButton.classList.toggle('-active', isChecked);

            const accordionCheckboxes = document.querySelectorAll('.kai-accordion-group .kai-checkbox input');
            accordionCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
        });
    }

    // 폼 영역 전체 선택
    const formAllCheckbox = document.querySelector('.kai-form__container .kai-checkbox.-all-check input');
    if (formAllCheckbox) {
        formAllCheckbox.addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('.kai-form__container .kai-checkbox:not(.-all-check) input');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }

    // 체크박스 그룹
    const checkboxGroups = document.querySelectorAll('.kai-checkbox__group[data-group]');
    checkboxGroups.forEach(group => {
        const groupName = group.getAttribute('data-group');
        const allCheckbox = group.querySelector('.kai-checkbox.-all input[type="checkbox"]');
        const otherCheckboxes = group.querySelectorAll('.kai-checkbox:not(.-all) input[type="checkbox"]');

        if (allCheckbox) {
            allCheckbox.addEventListener('change', function () {
                otherCheckboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                    updateCheckboxState(checkbox, groupName);
                });
            });

            otherCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function () {
                    const allChecked = Array.from(otherCheckboxes).every(cb => cb.checked);
                    allCheckbox.checked = allChecked;
                    updateCheckboxState(this, groupName);
                });
            });
        }
    });

    // ===================================
    // Custom Select Functionality
    // ===================================

    // 커스텀 셀렉트박스
    const selectTriggers = document.querySelectorAll('.kai-custom-select__trigger');
    selectTriggers.forEach(trigger => {
        const select = trigger.closest('.kai-custom-select');
        const formField = select.closest('.kai-form-field');
        const options = select.querySelector('.kai-custom-select__options');

        // 초기 상태 설정
        options.setAttribute('data-open', 'false');
        select.setAttribute('data-open', 'false');

        trigger.addEventListener('click', function(e) {
            e.stopPropagation();

            // disabled 상태 체크
            if (isElementDisabled(select) || isElementDisabled(formField)) {
                return;
            }

            // 다른 모든 셀렉트 닫기
            document.querySelectorAll('.kai-custom-select').forEach(s => {
                if (s !== select) {
                    s.setAttribute('data-open', 'false');
                    const otherOptions = s.querySelector('.kai-custom-select__options');
                    if (otherOptions) {
                        otherOptions.setAttribute('data-open', 'false');
                    }
                }
            });

            // 현재 셀렉트 토글
            const isOpen = select.getAttribute('data-open') === 'true';
            select.setAttribute('data-open', !isOpen);
            options.setAttribute('data-open', !isOpen);
        });
    });

    // 셀렉트 옵션
    const selectOptions = document.querySelectorAll('.kai-custom-select__option');
    selectOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();

            const select = option.closest('.kai-custom-select');
            const formField = select.closest('.kai-form-field');
            if (!select) return;

            // disabled 상태 체크
            if (isElementDisabled(select) || isElementDisabled(formField)) {
                return;
            }

            if (option.getAttribute('data-disabled') === 'true') return;

            const trigger = select.querySelector('.kai-custom-select__trigger');
            const options = select.querySelector('.kai-custom-select__options');
            const textElement = trigger.querySelector('.kai-custom-select__text');

            if (select.classList.contains('-multiple')) {
                handleMultipleSelect(option, select, textElement);
            } else {
                handleSingleSelect(option, select, textElement, options);
            }
        });
    });

    // 외부 클릭 시 셀렉트 닫기
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.kai-custom-select')) {
            document.querySelectorAll('.kai-custom-select').forEach(select => {
                select.setAttribute('data-open', 'false');
                const options = select.querySelector('.kai-custom-select__options');
                if (options) {
                    options.setAttribute('data-open', 'false');
                }
            });
        }
    });

    // ===================================
    // Form Field Functionality
    // ===================================

    // 폼 필드 기본 동작
    const formFields = document.querySelectorAll('.kai-form-field');
    formFields.forEach(field => {
        const input = field.querySelector('.kai-form-field__input');
        if (input) {
            input.addEventListener('focus', function () {
                field.classList.add('focused');
            });

            input.addEventListener('blur', function () {
                field.classList.remove('focused');
            });
        }
    });

    // ===================================
    // Disabled State Management
    // ===================================

    // disabled 상태 체크 함수
    function isElementDisabled(element) {
        if (!element) return false;
        return element.classList.contains('-disabled') || 
               element.classList.contains('-aria-disabled') ||
               element.hasAttribute('disabled');
    }

    // disabled 상태 토글 함수
    function toggleDisabled(element, isDisabled) {
        if (!element) return;

        if (isDisabled) {
            element.classList.add('-disabled');
            element.setAttribute('disabled', 'disabled');
            
            // 모든 입력 요소와 버튼 비활성화
            const inputs = element.querySelectorAll('input, select, textarea, button');
            inputs.forEach(input => {
                input.disabled = true;
                input.setAttribute('disabled', 'disabled');
            });

            // 아이콘 버튼의 경우 추가 처리
            if (element.classList.contains('kai-icon-button')) {
                element.style.pointerEvents = 'none';
                element.style.opacity = '0.5';
            }
        } else {
            element.classList.remove('-disabled');
            element.removeAttribute('disabled');
            
            // 모든 입력 요소와 버튼 활성화
            const inputs = element.querySelectorAll('input, select, textarea, button');
            inputs.forEach(input => {
                input.disabled = false;
                input.removeAttribute('disabled');
            });

            // 아이콘 버튼의 경우 추가 처리
            if (element.classList.contains('kai-icon-button')) {
                element.style.pointerEvents = 'auto';
                element.style.opacity = '1';
            }
        }
    }

    // aria-disabled 상태 토글 함수
    function toggleAriaDisabled(element, isDisabled) {
        if (!element) return;

        if (isDisabled) {
            element.classList.add('-aria-disabled');
            element.setAttribute('aria-disabled', 'true');
            element.setAttribute('disabled', 'disabled');
            
            // 모든 입력 요소와 버튼 비활성화
            const inputs = element.querySelectorAll('input, select, textarea, button');
            inputs.forEach(input => {
                input.setAttribute('aria-disabled', 'true');
                input.setAttribute('disabled', 'disabled');
            });

            // 아이콘 버튼의 경우 추가 처리
            if (element.classList.contains('kai-icon-button')) {
                element.style.pointerEvents = 'none';
                element.style.opacity = '0.5';
            }
        } else {
            element.classList.remove('-aria-disabled');
            element.setAttribute('aria-disabled', 'false');
            element.removeAttribute('disabled');
            
            // 모든 입력 요소와 버튼 활성화
            const inputs = element.querySelectorAll('input, select, textarea, button');
            inputs.forEach(input => {
                input.setAttribute('aria-disabled', 'false');
                input.removeAttribute('disabled');
            });

            // 아이콘 버튼의 경우 추가 처리
            if (element.classList.contains('kai-icon-button')) {
                element.style.pointerEvents = 'auto';
                element.style.opacity = '1';
            }
        }
    }

    // 버튼 클릭 이벤트에 disabled 체크 추가
    document.querySelectorAll('.kai-button, .kai-icon-button').forEach(button => {
        button.addEventListener('click', function(e) {
            if (isElementDisabled(this)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
    });

    // 체크박스 클릭 이벤트에 disabled 체크 추가
    document.querySelectorAll('.kai-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', function(e) {
            if (isElementDisabled(this)) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        });
    });

    // ===================================
    // Modal Functionality
    // ===================================

    // 모달 트리거
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modalCloseButtons = document.querySelectorAll('.kai-modal__close');

    // 모달 열기
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modalRoot = document.querySelector(`#${modalId}`).closest('.kai-modal-root');
            modalRoot.setAttribute('data-open', 'true');
        });
    });

    // 모달 닫기
    const closeModal = (modalRoot) => {
        modalRoot.setAttribute('data-open', 'false');
    };

    // 모달 닫기 버튼
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalRoot = this.closest('.kai-modal-root');
            closeModal(modalRoot);
        });
    });

    // 마스크 클릭시 닫기
    document.querySelectorAll('.kai-modal__mask').forEach(mask => {
        mask.addEventListener('click', function() {
            const modalRoot = this.closest('.kai-modal-root');
            closeModal(modalRoot);
        });
    });

    // 모달 외부 클릭 시 닫기
    document.querySelectorAll('.kai-modal-item').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                const modalRoot = this.closest('.kai-modal-root');
                closeModal(modalRoot);
            }
        });
    });

    // ===================================
    // Utility Functions
    // ===================================

    // 체크박스 상태 업데이트
    function updateCheckboxState(checkbox, groupName) {
        const option = checkbox.closest('.kai-custom-select__option');
        if (option) {
            option.setAttribute('data-selected', checkbox.checked);
        }

        switch (groupName) {
            case 'languages':
                // 언어 선택 관련 추가 동작
                break;
        }
    }

    // 전체 선택 상태 업데이트
    function updateToggleAllState() {
        const allCheckboxes = document.querySelectorAll('.kai-accordion-group .kai-checkbox input');
        const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
        const toggleButton = document.querySelector('.kai-toggle-button[data-control="all-items"]');
        
        if (toggleButton) {
            toggleButton.classList.toggle('-active', allChecked);
            toggleButton.querySelector('input').checked = allChecked;
        }
    }

    // 아코디언 스위치 상태 업데이트
    function updateAccordionSwitchState() {
        const accordionItems = document.querySelectorAll('.kai-accordion-group .kai-accordion-item');
        const allOpen = Array.from(accordionItems).every(item => item.classList.contains('-open'));
        const accordionSwitch = document.querySelector('.kai-switch.-extra.-small input');
        
        if (accordionSwitch) {
            accordionSwitch.checked = allOpen;
        }
    }

    // 다중 선택 처리
    function handleMultipleSelect(option, select, textElement) {
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (!checkbox) return;

        checkbox.checked = !checkbox.checked;
        option.setAttribute('data-selected', checkbox.checked);

        const selectedOptions = select.querySelectorAll('.kai-custom-select__option[data-selected="true"]');
        const selectedCount = selectedOptions.length;

        if (selectedCount === 0) {
            select.removeAttribute('data-has-value');
            textElement.textContent = '';
        } else {
            select.setAttribute('data-has-value', 'true');
            textElement.textContent = selectedCount === 1 
                ? selectedOptions[0].querySelector('span').textContent 
                : '다중선택';
        }
    }

    // 단일 선택 처리
    function handleSingleSelect(option, select, textElement, options) {
        select.querySelectorAll('.kai-custom-select__option').forEach(opt => {
            opt.removeAttribute('data-selected');
        });
        
        option.setAttribute('data-selected', 'true');
        select.setAttribute('data-has-value', 'true');
        textElement.textContent = option.querySelector('span').textContent;
        select.setAttribute('data-open', 'false');
        options.setAttribute('data-open', 'false');
    }

    // 텍스트에리어 자동 높이 조절
    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    // 텍스트에리어 이벤트 리스너
    document.querySelectorAll('.kai-form-field__item').forEach(textarea => {
        adjustTextareaHeight(textarea);
        textarea.addEventListener('input', () => adjustTextareaHeight(textarea));
        window.addEventListener('resize', () => adjustTextareaHeight(textarea));
    });

    // ===================================
    // Initialization
    // ===================================

    // 초기 disabled 상태 설정
    function initializeDisabledStates() {
        // 버튼
        const buttons = document.querySelectorAll('.kai-button, .kai-icon-button');
        buttons.forEach(button => {
            if (button.classList.contains('-disabled')) {
                toggleDisabled(button, true);
            }
            if (button.classList.contains('-aria-disabled')) {
                toggleAriaDisabled(button, true);
            }
        });

        // 폼 필드
        const formFields = document.querySelectorAll('.kai-form-field');
        formFields.forEach(field => {
            if (field.dataset.disabled === 'true') {
                toggleDisabled(field, true);
            }
            if (field.dataset.ariaDisabled === 'true') {
                toggleAriaDisabled(field, true);
            }
        });

        // 체크박스
        const checkboxes = document.querySelectorAll('.kai-checkbox');
        checkboxes.forEach(checkbox => {
            if (checkbox.classList.contains('-disabled')) {
                toggleDisabled(checkbox, true);
            }
            if (checkbox.classList.contains('-aria-disabled')) {
                toggleAriaDisabled(checkbox, true);
            }
        });
    }

    // 초기화 실행
	initializeDisabledStates();
	
	// 스위치 컨트롤
document.querySelectorAll('.kai-switch[data-control]').forEach(switchEl => {
    const input = switchEl.querySelector('.kai-switch__input');
    const controlType = switchEl.dataset.control;
    
    input.addEventListener('change', function() {
        switch(controlType) {
            case 'compare-toggle':
                document.querySelector('.kai-accordion-group').classList.toggle('-compare-open', this.checked);
                break;
            case 'prompt-toggle':
                document.querySelector('[data-target="prompt-container"]').classList.toggle('-visible', this.checked);
                break;
        }
    });
});
	
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('kai-tag__remove')) {
    const tag = e.target.closest('.kai-tag');
    if (tag) tag.remove();
  }
});
	
function setProgress(percent) {
  document.querySelector('.kai-progressbar-percent').textContent = percent + '%';
  if (percent < 100) {
    document.querySelector('.kai-progressbar-bar').style.display = 'block';
    document.querySelector('.kai-progressbar-spinner').style.display = 'none';
    document.querySelector('.kai-progressbar-bar__inner').style.width = percent + '%';
  } else {
    document.querySelector('.kai-progressbar-bar').style.display = 'none';
    document.querySelector('.kai-progressbar-spinner').style.display = 'block';
  }
}

document.querySelectorAll('.kai-form-field__item-box input[type="date"], .kai-form-field__item-box input[type="time"]').forEach(function(input) {
  input.addEventListener('click', function(e) {
    this.showPicker && this.showPicker();
  });
});
	
document.querySelectorAll('.kai-review-switch-row').forEach(function(row) {
  var radios = row.querySelectorAll('input[type="radio"]');
  var afterSpan = row.querySelector('.-review-after');
  var beforeSpan = row.querySelector('.-review-before');

  // Set initial state
  radios.forEach(function(radio) {
    const switchElement = radio.closest('label.kai-review-switch');
    if (switchElement) {
      switchElement.classList.toggle('-checked', radio.checked);
    }
  });

  radios.forEach(function(radio) {
    radio.addEventListener('change', function() {
      // Remove -checked class from all labels first
      row.querySelectorAll('label.kai-review-switch').forEach(label => {
        label.classList.remove('-checked');
      });

      // Add -checked class to the selected radio's label
      const switchElement = this.closest('label.kai-review-switch');
      if (switchElement) {
        switchElement.classList.add('-checked');
      }

      if (this.value === 'after') {
        afterSpan.classList.add('-show');
        beforeSpan.classList.remove('-show');
      } else {
        afterSpan.classList.remove('-show');
        beforeSpan.classList.add('-show');
      }
    });
  });
});
});