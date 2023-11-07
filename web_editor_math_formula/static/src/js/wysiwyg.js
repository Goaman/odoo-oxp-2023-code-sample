/** @odoo-module **/

import { Wysiwyg } from "@web_editor/js/wysiwyg/wysiwyg";
import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";

class FormulaWidget {
    constructor(element, odooEditor) {
        element.innerHTML = `
            <a class="btn btn-outline-secondary"></a>
            <textarea></textarea>
            <div class="formula-output"></div>
        `;
        this.value = element.getAttribute('data-formula-value');
        this.edition = false;

        this.button = element.querySelector('.btn');
        this.textarea = element.querySelector('textarea');
        this.formulaOutput = element.querySelector('.formula-output');

        this.button.addEventListener('click', () => {
            this.edition = !this.edition;
            if (!this.edition) {
                element.setAttribute('data-formula-value', this.value);
                odooEditor.historyStep();
            }
            this.update();
        });

        this.textarea.addEventListener('input', () => {
            this.value = this.textarea.value;

            this.update();
        });

        this.update();
    }
    update() {
        if (!this.edition) {
            this.button.textContent = _t('Edit');
            this.textarea.classList.add('d-none');
        } else {
            this.button.textContent = _t('Save');
            this.textarea.classList.remove('d-none');
        }
        this.textarea.value = this.value;
        katex.render(this.value || '', this.formulaOutput, {
            throwOnError: false,
        });
    }
}

const formulaWidgets = new WeakMap();

function getWidget(element, odooEditor) {
    let widget = formulaWidgets.get(element);
    if (!widget) {
        widget = new FormulaWidget(element, odooEditor);
    }
    return widget;
}

function updateWidgets(odooEditor) {
    for (const element of odooEditor.editable.querySelectorAll('.math-formula-container')) {
        const widget = getWidget(element, odooEditor);
        widget.value = element.getAttribute('data-formula-value');
        widget.update();
    }
}

patch(Wysiwyg.prototype, {
    async startEdition() {
        await super.startEdition(...arguments);

        patch(this.odooEditor, {
            onExternalHistorySteps() {
                super.onExternalHistorySteps(...arguments);
                updateWidgets(this);
            },
            historyStep() {
                super.historyStep(...arguments);
                updateWidgets(this);
            }
        });

        for (const element of this.odooEditor.editable.querySelectorAll('.math-formula-container')) {
            formulaWidgets.set(element, new FormulaWidget(element, this.odooEditor));
        }
    },
    _getPowerboxOptions() {
        const options = super._getPowerboxOptions(...arguments);

        options.categories.push({ name: _t('Math'), priority: 100 });
        options.commands.push({
            name: _t('Math formula'),
            description: _t('Add math formula'),
            fontawesome: "fa-superscript",
            category: _t('Math'),
            callback: () => {
                const element = document.createElement('div');
                element.classList.add('math-formula-container');
                element.classList.add('o_not_editable');
                element.setAttribute('data-oe-protected', 'true');
                element.setAttribute('data-oe-transient-content', 'true');

                formulaWidgets.set(element, new FormulaWidget(element, this.odooEditor));

                this.odooEditor.execCommand('insert', element);
            }
        });

        return options;
    }
});
