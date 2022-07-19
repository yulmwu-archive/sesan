<script>
    import { lines, words } from '../stores.js';

    let [_lines, _words] = [0, 0];

    lines.subscribe((v) => (_lines = v.length ?? 1));

    words.subscribe((v) => (_words = v));
</script>

<div class="footer">
    <p>{_lines} Lines, {_words} Words</p>
</div>

<style>
    div.footer {
        clear: both;
        position: fixed;
        bottom: 0;
        width: 100%;
        height: 20px;
        padding: 0 10px;
        background-color: #007acc;
    }
</style>
