import App from './App.svelte';

// @ts-ignore
require.config({
    paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs',
    },
});

let editor = null;

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

    monaco.languages.register({ id: 'tiny' });

    monaco.languages.setMonarchTokensProvider('tiny', {
        keywords,
        tokenizer: {
            root: [
                [/\/\/.*$/, 'comment'],
                [/\@.*$/, 'decorator'],
                [
                    /@?[a-zA-Z][\w$]*/,
                    {
                        cases: {
                            '@keywords': 'keyword',
                        },
                    },
                ],
                [/"([^"\\]|\\.)*"/, 'string'],
                [/'([^'\\]|\\.)*'/, 'string'],
                [/\d+/, 'number'],
            ],
        },
    });

    monaco.editor.defineTheme('tinyTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'identifier', foreground: '#C9C9C9' },
            {
                token: 'operator',
                foreground: '#BBBBBB',
            },
            { token: 'decorator', foreground: '#b366ff' },
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
                    label: 'true',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: 'true',
                },
                {
                    label: 'false',
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                    insertText: 'false',
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
            : `// Std is automatically imported.
// you can check examples from the \`Examples\` menu.
// click \`Run\` to execute the code. (Cannot run while evaluating)
// click \`Share\` to share the code. (Copy the URL)
// Enjoy!

println("Hello, World!");
`,
        language: 'tiny',
        theme: 'tinyTheme',
        automaticLayout: true,
        fontSize: 17,
        fontFamily: 'Fira Code',
    });
});

const app = new App({
    target: document.body,
});

export default app;
export { editor };
