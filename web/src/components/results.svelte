<script lang="ts">
    import { results, errors } from '../stores';

    let _results: string;

    results.subscribe((v) => {
        console.log(v);
        if (v.errors.length > 0) {
            errors.update(() => (v.errors ?? []).length);

            _results = (v.errors ?? []).join('\n');
        } else _results = (v.result ?? []).join('\n');
    });
</script>

<div class="sidebar">
    <textarea bind:value={_results} />
</div>

<style>
    div.sidebar {
        width: 30%;
        height: 100%;
        float: left;
        float: right;
        background-color: #252526;
    }

    div.sidebar > textarea {
        width: 100%;
        height: 100%;
        border: none;
        background-color: #252526;
        color: #fff;
        font-size: 14px;
        resize: none;
        outline: none;
        overflow-wrap: break-word;
        white-space: pre;
        overflow-x: scroll;
        padding: 15px;
    }

    @media (max-width: 940px) {
        div.sidebar {
            float: none;
            width: 100%;
        }

        div.sidebar > textarea {
            width: 100%;
            height: 20%;
        }
    }
</style>
