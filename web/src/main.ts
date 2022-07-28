/// <reference types="svelte" />
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
    // @ts-ignore
    monaco.languages.register({ id: 'tiny' });

    // @ts-ignore
    monaco.languages.setMonarchTokensProvider('tiny', {
        keywords: [
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
        ],
        tokenizer: {
            root: [
                [
                    /@?[a-zA-Z][\w$]*/,
                    {
                        cases: {
                            '@keywords': 'keyword',
                        },
                    },
                ],
                [/\/\/.*$/, 'comment'],
            ],
        },
    });

    // @ts-ignore
    monaco.editor.defineTheme('tinyTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'identifier', foreground: '#C9C9C9' },
            {
                token: 'operator',
                foreground: '#BBBBBB',
            },
        ],
    });

    // @ts-ignore
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
