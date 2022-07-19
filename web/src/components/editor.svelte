<script>
    import { lines, words } from '../stores.js';

    const onInput = (e) => {
        lines.update(() => e.target.value.split('\n'));
        words.update(() => e.target.value.length);
    };
</script>

<div class="editor">
    <textarea class="input" on:input={onInput} />
</div>

<style>
    div.editor {
        width: 70%;
        height: 100%;
        float: left;
        padding: 15px;
        margin-bottom: 20px;
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
