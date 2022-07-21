<script context="module" lang="ts">
    import { currentLine, currentColumn } from '../stores.js';

    const getCurrent = () => {
        const text = editor.value.substr(0, editor.selectionStart).split('\n');

        return {
            line: text.length,
            column: text[text.length - 1].length,
        };
    };

    const onInput = () => {
        currentLine.update(() => getCurrent().line);
        currentColumn.update(() => getCurrent().column);
    };

    let editor: HTMLTextAreaElement;

    export { editor };
</script>

<div class="editor">
    <textarea
        class="input"
        on:input={onInput}
        on:keydown={onInput}
        on:click={onInput}
        bind:this={editor}
        value={window.location.hash
            ? decodeURIComponent(window.location.hash.substr(1))
            : `// Welcome to the Tiny web interpreter.
// You can check examples from the \`Examples\` menu.
// Click \`Run\` to execute the code. (Cannot run while evaluating)
// Click \`Share\` to share the code. (Copy the URL)
// Enjoy!

println("Hello, World!");
`}
    />
</div>

<style>
    div.editor {
        width: 70%;
        height: 100%;
        float: left;
        padding: 15px;
        background-color: #1e1e1e;
    }

    div.editor > textarea {
        width: 100%;
        height: 100%;
        border: none;
        background-color: #1e1e1e;
        color: #fff;
        font-size: 14px;
        resize: none;
        outline: none;
        overflow-wrap: break-word;
        white-space: pre;
        overflow-x: scroll;
    }

    @media (max-width: 940px) {
        div.editor {
            float: left;
            width: 100%;
            height: 80%;
        }
    }
</style>
