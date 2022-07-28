<script lang="ts">
    import { evaluating, errors } from '../stores.js';
    let [_e, _errs] = [false, 0];

    evaluating.subscribe((v) => (_e = v));
    errors.subscribe((v) => (_errs = v));
</script>

<div class="footer">
    <p
        class="github"
        on:click={() => window.open('https://github.com/tsukiroku/tiny')}
    >
        Github
    </p>

    {#if !_e}
        <p class="evaluating">Ready</p>

        {#if _errs > 0}
            <p class="errors">{_errs} errors</p>
        {/if}
    {:else}
        <p class="evaluating">Evaluating...</p>
    {/if}
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

    div.footer > .evaluating {
        color: #ffffff;
        width: 80px;
        padding: 0 10px;
        display: inline;
        text-align: center;
        float: left;
        cursor: pointer;
    }

    div.footer > .errors {
        color: rgb(234, 24, 24);
        width: 80px;
        display: inline;
        float: left;
        cursor: pointer;
    }
</style>
