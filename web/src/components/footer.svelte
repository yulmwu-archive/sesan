<script lang="ts">
    import { evaluating, errors } from '../stores.js';
    let [isEvaluating, countErrors] = [false, 0];

    evaluating.subscribe((v) => (isEvaluating = v));
    errors.subscribe((v) => (countErrors = v));
</script>

<div class="clear-both fixed bottom-0 w-full h-[1.4rem] bg-footer">
    <p
        class="bg-emerald-600 hover:bg-emerald-500 w-20 pb-2.5 inline text-center float-left cursor-pointer"
        on:click={() => window.open('https://github.com/tsukiroku/tiny')}
    >
        Github
    </p>

    {#if !isEvaluating}
        <p class="pl-3 inline text-center float-left cursor-pointer">Ready</p>

        {#if countErrors > 0}
            <p class="pl-3 text-red-400 inline float-left cursor-pointer">
                {countErrors} errors
            </p>
        {/if}
    {:else}
        <p class="pl-3 inline text-center float-left cursor-pointer">
            Evaluating...
        </p>
    {/if}
</div>
