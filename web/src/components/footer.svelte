<script>
    import { currentLine, currentColumn } from '../stores.js';
    let [_curr, _column] = [1, 0];

    currentLine.subscribe((v) => (_curr = v));
    currentColumn.subscribe((v) => (_column = v));
</script>

<div class="footer">
    <p
        class="github"
        on:click={() => window.open('https://github.com/tsukiroku/tiny')}
    >
        Github
    </p>
    <p class="curr">Ln {_curr}, Col {_column}</p>
</div>

<style>
    div.footer {
        clear: both;
        position: fixed;
        bottom: 0;
        width: 100%;
        height: 20px;
        background-color: #007acc;
    }

    div.footer > .github {
        background-color: #329171;
        width: 80px;
        padding: 0 10px;
        display: inline;
        text-align: center;
        float: left;
        cursor: pointer;
    }

    div.footer > .github:hover {
        background-color: #369c7a;
    }

    div.footer > .curr {
        margin-right: 10px;
        display: inline;
        float: right;
    }
</style>
