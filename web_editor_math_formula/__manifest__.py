# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'Editor Math Formula',
    'description': """
        Math formula widget for the OdooEditor.
""",
    'depends': ['web_editor'],
    'assets': {
        'web_editor.assets_wysiwyg': [
            'web_editor_math_formula/static/lib/katex/katex.min.css',
            'web_editor_math_formula/static/lib/katex/katex.min.js',
            'web_editor_math_formula/static/src/js/wysiwyg.js',
            'web_editor_math_formula/static/src/scss/wysiwyg.scss',
        ],
    },
    'license': 'LGPL-3',
}
