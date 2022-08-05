import App from './App.svelte';
import type { IExamplesGroup } from './types';

// @ts-ignore
require.config({
    paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs',
    },
});

let editor = null;

window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) =>
        editor.updateOptions({
            theme: e.matches ? 'tinyTheme' : 'tinyTheme-light',
        })
    );

// @ts-ignore
require(['vs/editor/editor.main'], () => {
    const keywords = [
        'let',
        'func',
        'true',
        'false',
        'if',
        'else',
        'return',
        'while',
        'in',
        'typeof',
        'null',
        'throw',
        'delete',
        'use',
    ];

    const stds = [
        // IO
        'print',
        'println',
        'readline',
        // ARRAY
        'push',
        'pop',
        'shift',
        'unshift',
        'slice',
        'join',
        'forEach',
        'repeat',
        // UTIL
        'funcTools',
        'length',
        'match',
        'string',
        'number',
        'boolean',
        'ternary',
        // STRING
        'subString',
        'rMatch',
        'rTest',
        'replace',
        'split',
        'concat',
        // OBJECT
        'assign',
    ];

    const builtins = [
        'import',
        'eval',
        'js',
        'convert',
        'options',
        'setOption',
        'regex',
        'this',
        '__root',
        '__pos',
        '__filename',
    ];

    monaco.languages.register({ id: 'tiny' });

    monaco.languages.setLanguageConfiguration('tiny', {
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
        ],
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
        ],
        comments: {
            lineComment: '//',
        },
    });

    monaco.languages.setMonarchTokensProvider('tiny', {
        keywords,
        stds,
        builtins,
        tokenizer: {
            root: [
                [/\/\/.*$/, 'comment'],
                [/\@.*$/, 'decorator'],
                [/[{}()\[\]]/, 'bracket'],
                [
                    /@?[a-zA-Z_][\w$]*/,
                    {
                        cases: {
                            '@keywords': 'keyword',
                            '@stds': 'function',
                            '@builtins': 'builtin',
                            '@default': 'identifier',
                        },
                    },
                ],
                [/[a-zA-Z_][a-zA-Z0-9_]*\(/, 'function'],
                [/'[^']*'/, 'string'],
                [/"[^"]*"/, 'string'],
                [/\d+/, 'number'],
                [/[<>](?!@)/, 'delimiter'],
                [/@?[=!+\-*%&|^~/]/, 'delimiter'],
                [/[?:;.,]/, 'delimiter'],
                [/\s+/, 'white'],
            ],
        },
    });

    monaco.editor.defineTheme('tinyTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'identifier', foreground: '#BBBBBB' },
            { token: 'decorator', foreground: '#b366ff' },
            { token: 'delimiter', foreground: '#BBBBBB' },
            { token: 'bracket', foreground: '#BBBBBB' },
            { token: 'function', foreground: '#dcdc90' },
            { token: 'builtin', foreground: '#f75278' },
        ],
    });

    monaco.editor.defineTheme('tinyTheme-light', {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'identifier', foreground: '#1c1c1c' },
            { token: 'decorator', foreground: '#7c2fd4' },
            { token: 'delimiter', foreground: '#1c1c1c' },
            { token: 'bracket', foreground: '#1c1c1c' },
            { token: 'function', foreground: '#94a31f' },
            { token: 'builtin', foreground: '#b82144' },
        ],
    });

    monaco.languages.registerCompletionItemProvider('tiny', {
        provideCompletionItems: () => ({
            suggestions: [
                ...keywords.map((keyword) => ({
                    label: keyword,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: keyword,
                })),
                {
                    label: 'let',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: 'let ${1:name} = ${2:literal};',
                },
                {
                    label: 'func',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: 'func ${1:name}(${2:params}) {\n\t${3:body}\n}',
                },
                {
                    label: 'if',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: 'if (${1:condition}) {\n\t${2:body}\n}',
                },
                {
                    label: 'else',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: 'else {\n\t${1:body}\n}',
                },
                {
                    label: 'return',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: 'return ${1:value};',
                },
                {
                    label: 'while',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: 'while (${1:condition}) {\n\t${2:body}\n}',
                },
                {
                    label: 'in',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: 'in',
                },
                {
                    label: 'typeof',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: 'typeof ${1:value}',
                },
                {
                    label: 'null',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: 'null',
                },
                {
                    label: 'throw',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: "throw '${1:message}';",
                },
                {
                    label: 'delete',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: 'delete ${1:env};',
                },
                {
                    label: 'use',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: "use '${1:path};'",
                },
            ],
        }),
    });

    editor = monaco.editor.create(document.getElementById('editor'), {
        value: window.location.hash
            ? decodeURIComponent(window.location.hash.substr(1))
            : `// Welcome to the Tiny language playground.
// Try writing some code, try running it.
// you can run it by clicking the 'Run' button.

// Try it
// - Share    : you can share your code by url.
// - Docs     : https://github.com/tsukiroku/tiny/tree/main/docs
// - Examples : you can find some examples here.

// Enjoy!

let someVariable = 'Hello, World!';
println(someVariable);
`,
        language: 'tiny',
        theme:
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'tinyTheme'
                : 'tinyTheme-light',
        automaticLayout: true,
        fontSize: 17,
        fontFamily: 'Fira Code',
        fontLigatures: true,
    });
});

const examples: Array<IExamplesGroup> = [
    {
        name: 'Hello, World!',
        examples: [
            {
                name: 'Hello, World!',
                source: 'hello_world.tiny',
            },
            {
                name: 'Fibonacci',
                source: 'fibonacci.tiny',
            },
            {
                name: 'Tiny interpreter',
                source: 'interpreter.tiny',
            },
        ],
    },
    {
        name: 'Variables & Data types',
        examples: [
            {
                name: 'Variable',
                source: 'variable.tiny',
            },
            {
                name: 'Function',
                source: 'function.tiny',
            },
            {
                name: 'Hash',
                source: 'hash.tiny',
            },
        ],
    },
    {
        name: 'Operators & Decorators',
        examples: [
            {
                name: 'Operator',
                source: 'operators.tiny',
            },
            {
                name: 'Decorator',
                source: 'decorators.tiny',
            },
        ],
    },
    {
        name: 'Control flow',
        examples: [
            {
                name: 'If',
                source: 'if.tiny',
            },
            {
                name: 'While',
                source: 'while.tiny',
            },
            {
                name: 'Import',
                source: 'import.tiny',
            },
        ],
    },
    {
        name: 'Standard library',
        examples: [
            {
                name: 'IO',
                source: '/stdlib/io.tiny',
            },
            {
                name: 'Array',
                source: '/stdlib/array.tiny',
            },
            {
                name: 'String',
                source: '/stdlib/string.tiny',
            },
            {
                name: 'Utility',
                source: '/stdlib/util.tiny',
            },
        ],
    },
];

const app = new App({
    target: document.body,
});

export default app;
export { editor, examples };
