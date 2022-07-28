<div class="editor">
    <div class="input" id="editor" />
</div>

<style>
    div.editor {
        width: 70%;
        height: 100%;
        float: left;
        background-color: #1e1e1e;
    }

    div.editor > .input {
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
    }

    @media (max-width: 940px) {
        div.editor {
            float: left;
            width: 100%;
            height: 80%;
        }
    }
</style>
