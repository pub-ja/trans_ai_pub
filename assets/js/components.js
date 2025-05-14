// Constants
const disabledOpacity = 0.5;
const selectors = {
    accordion: {
        header: '.kai-accordion-header',
        item: '.kai-accordion-item',
        content: '.kai-accordion-content'
    },
    checkbox: {
        input: '.kai-checkbox input',
        group: '.kai-checkbox__group[data-group]',
        all: '.kai-checkbox.-all-check input[type="checkbox"]'
    },
    select: {
        container: '.kai-custom-select',
        trigger: '.kai-custom-select__trigger',
        options: '.kai-custom-select__options',
        option: '.kai-custom-select__option',
        text: '.kai-custom-select__text'
    }
};

/**
 *  메인 초기화
 */
document.addEventListener('DOMContentLoaded', function () {
    initializeAccordion();
    initializeCheckboxes();
    initializeCustomSelect();
    initializeDisabledStates();
    ModalModule.init();
    ToggleButtonModule.init();
    ReviewSwitchModule.init();
    TextareaModule.init();
});

/**
 * Accordion 
 */
const AccordionModule = {
    init() {
        // 아코디언탑 클릭하면 오픈
        document.addEventListener('click', (e) => {
            const header = e.target.closest(selectors.accordion.header);
            if (!header) {
                const formHeader = e.target.closest('.kai-form__container.-accordion .kai-form__top');
                if (formHeader) {
                    const container = formHeader.closest('.kai-form__container');
                    container.classList.toggle('-open');
                    return;
                }
                return;
            }

            const accordionItem = header.closest(selectors.accordion.item);
            if (accordionItem) {
                accordionItem.classList.toggle('-open');
                this.updateAccordionState();
            }
        });

        // 상단 전체열기 클릭시 모든 아코디언 오픈
        const allAccordionSwitch = document.querySelector('.kai-switch[data-control="all-accordion"] input');
        if (allAccordionSwitch) {
            allAccordionSwitch.addEventListener('change', (e) => {
                const accordionItems = document.querySelectorAll(selectors.accordion.item);
                accordionItems.forEach(item => item.classList.toggle('-open', e.target.checked));
            });
        }
    },

    updateAccordionState() {
        try {
            const allAccordions = document.querySelectorAll(selectors.accordion.item);
            const allOpen = Array.from(allAccordions).every(item => item.classList.contains('-open'));
            const switchInput = document.querySelector('.kai-switch[data-control="all-accordion"] input');
            if (switchInput) {
                switchInput.checked = allOpen;
            }
        } catch (error) {
            console.error('Error updating accordion state:', error);
        }
    }
};

/**
 * Checkbox 
 */
const CheckboxModule = {
    init() {
        this.setupCheckboxGroups();
        this.setupGlobalCheckboxes();
        this.setupAccordionCheckboxes();
    },

    setupCheckboxGroups() {
        const groups = document.querySelectorAll(selectors.checkbox.group);
        groups.forEach(group => {
            const groupName = group.getAttribute('data-group');
            const allCheckbox = group.querySelector(selectors.checkbox.all);
            const otherCheckboxes = group.querySelectorAll(`${selectors.checkbox.input}:not(.-all-check)`);

            if (allCheckbox) {
                this.setupGroupCheckboxes(allCheckbox, otherCheckboxes, groupName);
            }
        });
    },

    setupGroupCheckboxes(allCheckbox, otherCheckboxes, groupName) {
        allCheckbox.addEventListener('change', () => {
            otherCheckboxes.forEach(checkbox => {
                checkbox.checked = allCheckbox.checked;
                this.updateCheckboxState(checkbox, groupName);
            });
        });

        otherCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const allChecked = Array.from(otherCheckboxes).every(cb => cb.checked);
                allCheckbox.checked = allChecked;
                this.updateCheckboxState(checkbox, groupName);
            });
        });
    },

    setupGlobalCheckboxes() {
        const toggleAll = document.querySelector('.kai-toggle-button[data-control="all-items"] input');
        if (toggleAll) {
            toggleAll.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                e.target.closest('.kai-toggle-button').classList.toggle('-active', isChecked);
                
                // 모든 아코디언 헤더의 체크박스와 내용의 체크박스들을 제어
                document.querySelectorAll('.kai-accordion-group .kai-accordion-header__inner input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = isChecked;
                });
                document.querySelectorAll('.kai-accordion-group .kai-accordion-content__elements input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = isChecked;
                });
            });
        }
    },

    setupAccordionCheckboxes() {
        // 각 아코디언 헤더의 체크박스 설정
        document.querySelectorAll('.kai-accordion-group .kai-accordion-header__inner input[type="checkbox"]').forEach(headerCheckbox => {
            headerCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                const accordionItem = headerCheckbox.closest('.kai-accordion-item');
                
                // 해당 아코디언의 내용에 있는 모든 체크박스 제어
                if (accordionItem) {
                    const contentCheckboxes = accordionItem.querySelectorAll('.kai-accordion-content__elements input[type="checkbox"]');
                    contentCheckboxes.forEach(checkbox => {
                        checkbox.checked = isChecked;
                    });
                }

                // 모든 체크박스가 체크되었는지 확인하여 최상위 체크박스 상태 업데이트
                this.updateGlobalCheckboxState();
            });
        });

        // 아코디언 내용의 체크박스들 설정
        document.querySelectorAll('.kai-accordion-group .kai-accordion-content__elements input[type="checkbox"]').forEach(contentCheckbox => {
            contentCheckbox.addEventListener('change', () => {
                const accordionItem = contentCheckbox.closest('.kai-accordion-item');
                if (accordionItem) {
                    const headerCheckbox = accordionItem.querySelector('.kai-accordion-header__inner input[type="checkbox"]');
                    const contentCheckboxes = accordionItem.querySelectorAll('.kai-accordion-content__elements input[type="checkbox"]');
                    
                    // 모든 체크박스가 체크되었는지 확인
                    const allChecked = Array.from(contentCheckboxes).every(cb => cb.checked);
                    if (headerCheckbox) {
                        headerCheckbox.checked = allChecked;
                    }
                }

                // 모든 체크박스가 체크되었는지 확인하여 최상위 체크박스 상태 업데이트
                this.updateGlobalCheckboxState();
            });
        });
    },

    updateGlobalCheckboxState() {
        const toggleAll = document.querySelector('.kai-toggle-button[data-control="all-items"] input');
        if (toggleAll) {
            const allCheckboxes = document.querySelectorAll('.kai-accordion-group .kai-accordion-content__elements input[type="checkbox"]');
            const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
            toggleAll.checked = allChecked;
            toggleAll.closest('.kai-toggle-button').classList.toggle('-active', allChecked);
        }
    },

    updateCheckboxState(checkbox, groupName) {
        try {
            // 체크박스 상태 업데이트
            const event = new CustomEvent('checkboxStateChange', {
                detail: { checkbox, groupName, checked: checkbox.checked }
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Error updating checkbox state:', error);
        }
    }
};

/**
 * Custom Select 
 */
const CustomSelectModule = {
    init() {
        this.setupSelectTriggers();
        this.setupSelectOptions();
        this.setupClickOutside();
        this.setupKeyboardNavigation();
    },

    setupSelectTriggers() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest(selectors.select.trigger);
            if (!trigger) return;

            const select = trigger.closest(selectors.select.container);
            const formField = select?.closest('.kai-form-field');

            if (select && !StateManager.isDisabled(select) && !StateManager.isDisabled(formField)) {
                this.toggleSelect(select);
            }
        });
    },

    setupSelectOptions() {
        document.addEventListener('click', (e) => {
            const option = e.target.closest(selectors.select.option);
            if (!option) return;

            const select = option.closest(selectors.select.container);
            if (!select || option.getAttribute('data-disabled') === 'true') return;

            const isMultiple = select.classList.contains('-multiple');
            const textElement = select.querySelector(selectors.select.text);

            // 멀티 셀렉트의 경우 체크박스 클릭 이벤트 처리
            if (isMultiple && e.target.closest('input[type="checkbox"]')) {
                this.handleMultipleSelect(option, select, textElement);
                return;
            }

            isMultiple ? 
                this.handleMultipleSelect(option, select, textElement) :
                this.handleSingleSelect(option, select, textElement);
        });
    },

    setupClickOutside() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest(selectors.select.container)) {
                this.closeAllSelects();
            }
        });
    },

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const select = e.target.closest(selectors.select.container);
            if (!select) return;

            switch (e.key) {
                case 'Escape':
                    this.closeAllSelects();
                    break;
                case 'ArrowDown':
                case 'ArrowUp':
                    this.handleArrowNavigation(select, e.key === 'ArrowDown');
                    break;
                case 'Enter':
                case ' ':
                    this.handleEnterSpace(select, e);
                    break;
            }
        });
    },

    toggleSelect(select) {
        const isOpen = select.getAttribute('data-open') === 'true';
        this.closeAllSelects();
        select.setAttribute('data-open', !isOpen);
        select.querySelector(selectors.select.options)?.setAttribute('data-open', !isOpen);
    },

    closeAllSelects() {
        document.querySelectorAll(selectors.select.container).forEach(select => {
            select.setAttribute('data-open', 'false');
            select.querySelector(selectors.select.options)?.setAttribute('data-open', 'false');
        });
    },

    handleMultipleSelect(option, select, textElement) {
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (!checkbox) return;

        // 현재 선택 상태 확인 및 토글
        const isSelected = checkbox.checked;
        checkbox.checked = !isSelected;
        option.setAttribute('data-selected', (!isSelected).toString());

        // 선택된 옵션 텍스트 업데이트
        const allOptions = select.querySelectorAll(selectors.select.option);
        const selectedOptions = select.querySelectorAll(`${selectors.select.option}[data-selected="true"]`);
        const selectedCount = selectedOptions.length;
        const totalCount = allOptions.length;

        if (selectedCount === 0) {
            select.removeAttribute('data-has-value');
            textElement.textContent = select.querySelector('.kai-custom-select__placeholder')?.textContent || '';
        } else {
            select.setAttribute('data-has-value', 'true');
            if (selectedCount === totalCount) {
                textElement.textContent = '전체선택';
            } else if (selectedCount === 1) {
                textElement.textContent = selectedOptions[0].querySelector('span').textContent;
            } else {
                textElement.textContent = '다중선택';
            }
        }

        // CustomEvent 발생
        const event = new CustomEvent('multiSelectChange', {
            detail: {
                select,
                selectedOptions: Array.from(selectedOptions),
                selectedCount,
                changedOption: option,
                isSelected: !isSelected
            }
        });
        select.dispatchEvent(event);
    },

    handleSingleSelect(option, select, textElement) {
        // 기존 선택 해제
        select.querySelectorAll(selectors.select.option).forEach(opt => {
            opt.setAttribute('data-selected', 'false');
            const checkbox = opt.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
        });
        
        // 새로운 옵션 선택
        option.setAttribute('data-selected', 'true');
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = true;

        // 텍스트 업데이트
        select.setAttribute('data-has-value', 'true');
        textElement.textContent = option.querySelector('span')?.textContent || option.textContent;

        // 셀렉트 닫기
        this.closeAllSelects();

        // CustomEvent 발생
        const event = new CustomEvent('singleSelectChange', {
            detail: {
                select,
                selectedOption: option,
                value: option.getAttribute('data-value')
            }
        });
        select.dispatchEvent(event);
    },

    handleArrowNavigation(select, isDown) {
        const options = Array.from(select.querySelectorAll(`${selectors.select.option}:not([data-disabled="true"])`));
        const currentOption = select.querySelector(`${selectors.select.option}[data-selected="true"]`);
        let currentIndex = options.indexOf(currentOption);

        if (currentIndex === -1) {
            currentIndex = isDown ? -1 : options.length;
        }

        const nextIndex = isDown ? 
            Math.min(currentIndex + 1, options.length - 1) : 
            Math.max(currentIndex - 1, 0);

        const nextOption = options[nextIndex];
        if (nextOption) {
            const textElement = select.querySelector(selectors.select.text);
            if (select.classList.contains('-multiple')) {
                this.handleMultipleSelect(nextOption, select, textElement);
            } else {
                this.handleSingleSelect(nextOption, select, textElement);
            }
            nextOption.focus();
        }
    },

    handleEnterSpace(select, event) {
        event.preventDefault();
        const option = event.target.closest(selectors.select.option);
        if (!option) return;

        const textElement = select.querySelector(selectors.select.text);
        if (select.classList.contains('-multiple')) {
            this.handleMultipleSelect(option, select, textElement);
        } else {
            this.handleSingleSelect(option, select, textElement);
        }
    }
};

/**
 * 상태관리 -disabled 클래스일때 아이템 disabled 처리
 */ 
const StateManager = {
    init() {
        this.setupDisabledHandlers();
        this.initializeDisabledStates();
    },

    isDisabled(element) {
        if (!element) return false;
        return element.classList.contains('-disabled') ||
               element.classList.contains('-disabled') ||
               element.hasAttribute('disabled');
    },

    setDisabled(element, isDisabled) {
        if (!element) return;

        const className = '-disabled';
        element.classList.toggle(className, isDisabled);
        element.toggleAttribute('disabled', isDisabled);

        // 모든 입력 요소와 버튼 비활성화/활성화
        const inputs = element.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
            input.disabled = isDisabled;
            input.toggleAttribute('disabled', isDisabled);
        });

        if (element.classList.contains('kai-icon-button')) {
            element.style.pointerEvents = isDisabled ? 'none' : 'auto';
            element.style.opacity = isDisabled ? disabledOpacity : '1';
        }

        // ARIA diabled
        element.setAttribute('aria-disabled', isDisabled);
    },

    setupDisabledHandlers() {
        // 버튼 클릭 이벤트에 disabled 체크 추가
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.kai-button, .kai-icon-button');
            if (button && this.isDisabled(button)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true);

        // 체크박스 클릭 이벤트에 disabled 체크 추가
        document.addEventListener('click', (e) => {
            const checkbox = e.target.closest('.kai-checkbox');
            if (checkbox && this.isDisabled(checkbox)) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }, true);
    },

    initializeDisabledStates() {
        // 버튼 초기화
        document.querySelectorAll('.kai-button, .kai-icon-button').forEach(button => {
            if (button.classList.contains('-disabled')) {
                this.setDisabled(button, true);
            }
        });

        // 폼 필드 초기화
        document.querySelectorAll('.kai-form-field').forEach(field => {
            if (field.classList.contains('-disabled')) {
                this.setDisabled(field, true);
            }
        });

        // 폼 필드 아이템 박스 초기화
        document.querySelectorAll('.kai-form-field__item-box').forEach(box => {
            if (box.classList.contains('-disabled')) {
                this.setDisabled(box, true);
            }
        });

        // 체크박스 초기화
        document.querySelectorAll('.kai-checkbox').forEach(checkbox => {
            if (checkbox.classList.contains('-disabled')) {
                this.setDisabled(checkbox, true);
            }
        });

        // 커스텀 셀렉트 초기화
        document.querySelectorAll('.kai-custom-select').forEach(select => {
            if (select.classList.contains('-disabled')) {
                this.setDisabled(select, true);
            }
        });
    }
};

/**
 * Toggle Button 
 */
const ToggleButtonModule = {
    init() {
        this.setupToggleButtons();
        this.setupBottomSheetToggle();
        this.setupSwitchControls();
    },

    setupToggleButtons() {
        document.querySelectorAll('.kai-toggle-icon-button').forEach(button => {
            const input = button.querySelector('input[type="checkbox"]');
            if (!input) return;

            input.addEventListener('change', () => {
                button.classList.toggle('-checked', input.checked);
            });
        });
    },

    setupBottomSheetToggle() {
        document.querySelectorAll('.kai-toggle-icon-button[data-target="additional-sheet"]').forEach(button => {
            const input = button.querySelector('input[type="checkbox"]');
            if (!input) return;

            input.addEventListener('change', () => {
                this.handleBottomSheetToggle(input.checked);
            });
        });

        // 바텀시트 닫기 버튼
        const closeButton = document.querySelector('.kai-main-bottom-sheet__button-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.handleBottomSheetToggle(false);
                // 모든 토글 버튼 상태 해제
                document.querySelectorAll('.kai-toggle-icon-button[data-target="additional-sheet"]').forEach(toggleButton => {
                    toggleButton.classList.remove('-checked');
                    const input = toggleButton.querySelector('input[type="checkbox"]');
                    if (input) input.checked = false;
                });
            });
        }
    },

    handleBottomSheetToggle(isOpen) {
        const additionalSheet = document.querySelector('.kai-main-bottom.-additional-sheet');
        const mainBottom = document.querySelector('.kai-main-bottom:not(.-additional-sheet)');
        const layout = document.querySelector('.kai-layout');
        
        if (!additionalSheet || !layout) return;
        
        if (isOpen) {
            additionalSheet.classList.add('-open');
            
            // 메인 바텀이 있는 경우에만 bottom 위치 조정
            if (mainBottom) {
                const mainBottomHeight = mainBottom.offsetHeight;
                additionalSheet.style.bottom = mainBottomHeight + 'px';
            }
            
            // 총 높이 계산 (메인 바텀이 없으면 0으로 처리)
            const mainBottomHeight = mainBottom ? mainBottom.offsetHeight : 0;
            const totalHeight = mainBottomHeight + additionalSheet.offsetHeight;
            const oneRem = parseInt(getComputedStyle(document.documentElement).fontSize);
            
            // 총 높이 + 1rem을 패딩 바텀으로 설정
            layout.style.paddingBottom = (totalHeight + oneRem) + 'px';
        } else {
            additionalSheet.classList.remove('-open');
            additionalSheet.style.bottom = '';
            layout.style.paddingBottom = '';
        }
    },

    setupSwitchControls() {
        document.querySelectorAll('.kai-switch[data-control]').forEach(switchEl => {
            const input = switchEl.querySelector('.kai-switch__input');
            if (!input) return;

            input.addEventListener('change', () => {
                const controlType = switchEl.dataset.control;
                switch(controlType) {
                    case 'compare-toggle':
                        document.querySelector('.kai-accordion-group')
                            ?.classList.toggle('-compare-open', input.checked);
                        break;
                    case 'prompt-toggle':
                        document.querySelector('[data-target="prompt-container"]')
                            ?.classList.toggle('-visible', input.checked);
                        break;
                }
            });
        });
    }
};

/**
 * 리뷰 Switch 
 */
const ReviewSwitchModule = {
    init() {
        document.querySelectorAll('.kai-review-switch-row').forEach(row => {
            const radios = row.querySelectorAll('input[type="radio"]');
            const afterSpan = row.querySelector('.-review-after');
            const beforeSpan = row.querySelector('.-review-before');

            // Set initial state
            radios.forEach(radio => {
                const switchElement = radio.closest('label.kai-review-switch');
                if (switchElement) {
                    switchElement.classList.toggle('-checked', radio.checked);
                }
            });

            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    // Remove -checked class from all labels first
                    row.querySelectorAll('label.kai-review-switch').forEach(label => {
                        label.classList.remove('-checked');
                    });

                    // Add -checked class to the selected radio's label
                    const switchElement = radio.closest('label.kai-review-switch');
                    if (switchElement) {
                        switchElement.classList.add('-checked');
                    }

                    if (radio.value === 'after') {
                        afterSpan.classList.add('-show');
                        beforeSpan.classList.remove('-show');
                    } else {
                        afterSpan.classList.remove('-show');
                        beforeSpan.classList.add('-show');
                    }
                });
            });
        });
    }
};

/**
 * Textarea 
 */
const TextareaModule = {
    init() {
        // -fixed-height가 없는 textarea만 선택
        document.querySelectorAll('.kai-form-field__item:not(.kai-form-field__item-box.-fixed-height textarea)').forEach(textarea => {
            this.setupTextareaAutoHeight(textarea);
        });
        this.setupResizeListener();
    },

    setupTextareaAutoHeight(textarea) {
        // 초기 높이 설정
        this.adjustHeight(textarea);
        
        // input 이벤트로 높이 자동 조절
        textarea.addEventListener('input', () => this.adjustHeight(textarea));
    },

    setupResizeListener() {
        // resize 이벤트로 높이 자동 조절
        window.addEventListener('resize', () => {
            document.querySelectorAll('.kai-form-field__item:not(.kai-form-field__item-box.-fixed-height textarea)').forEach(textarea => {
                this.adjustHeight(textarea);
            });
        });
    },

    adjustHeight(textarea) {
        // 높이 재설정
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
};

// Tag 삭제 
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('kai-tag__remove')) {
        const tag = e.target.closest('.kai-tag');
        if (tag) tag.remove();
    }
});

// Initialize all 
function initializeAccordion() {
    AccordionModule.init();
}
function initializeCheckboxes() {
    CheckboxModule.init();
}
function initializeCustomSelect() {
    CustomSelectModule.init();
}
function initializeDisabledStates() {
    StateManager.init();
}

/**
 * Modal 
 */
const ModalModule = {
    init() {
        this.setupModalTriggers();
        this.setupCloseButtons();
        this.setupOutsideClicks();
    },

    setupModalTriggers() {
        document.querySelectorAll('[data-modal]').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modalId = trigger.getAttribute('data-modal');
                const modalRoot = document.querySelector(`#${modalId}`).closest('.kai-modal-root');
                this.openModal(modalRoot);
            });
        });
    },

    setupCloseButtons() {
        document.querySelectorAll('.kai-modal__close, .kai-modal__button-close').forEach(button => {
            button.addEventListener('click', () => {
                const modalRoot = button.closest('.kai-modal-root');
                this.closeModal(modalRoot);
            });
        });

        // 마스크 클릭시 닫기
        document.querySelectorAll('.kai-modal__mask').forEach(mask => {
            mask.addEventListener('click', () => {
                const modalRoot = mask.closest('.kai-modal-root');
                this.closeModal(modalRoot);
            });
        });
    },

    setupOutsideClicks() {
        document.querySelectorAll('.kai-modal-item').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    const modalRoot = modal.closest('.kai-modal-root');
                    this.closeModal(modalRoot);
                }
            });
        });
    },

    openModal(modalRoot) {
        if (!modalRoot) return;
        modalRoot.setAttribute('data-open', 'true');
    },

    closeModal(modalRoot) {
        if (!modalRoot) return;
        modalRoot.setAttribute('data-open', 'false');
    }
};