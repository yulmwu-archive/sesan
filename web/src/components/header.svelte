<script lang="ts">
    import { results, evaluating, errors } from '../stores';
    import { editor } from './editor.svelte';
    import type { IExamples } from '../types';
    import axios from 'axios';

    let disabled = false;

    evaluating.subscribe((v) => (disabled = !v));

    const _eval = () => {
        if (disabled) {
            evaluating.update(() => true);
            errors.update(() => 0);

            axios
                .get(
                    `https://tiny-tsukiroku.vercel.app/eval/${encodeURIComponent(
                        editor.value
                    )}`
                )
                .then((res) => results.update(() => res.data))
                .catch((err) =>
                    results.update(() => ({
                        result: [],
                        errors: [
                            `[Evaluating] ${err}, Check if the code is an infinite loop.`,
                        ],
                    }))
                )
                .finally(() => evaluating.update(() => false));
        } else {
            results.update(() => ({
                result: [],
                errors: ['Evaluating...'],
            }));
        }
    };

    const examples: Array<IExamples> = [
        {
            name: 'Examples',
            source: '',
            disabled: true,
        },
        {
            name: 'Hello, World!',
            source: 'hello_world.tiny',
        },
        {
            name: 'Fibonacci',
            source: 'fibonacci.tiny',
        },
    ];

    let selected = examples[0];

    const example = () =>
        axios
            .get(
                `https://raw.githubusercontent.com/tsukiroku/tiny/main/examples/${selected.source}`
            )
            .then((res) => (editor.value = res.data));

    const share = () =>
        (window.location.href = `#${encodeURIComponent(editor.value)}`);
</script>

<div class="header">
    <p class="run" on:click={_eval} {disabled}>Run</p>

    <p class="share" on:click={share}>Share</p>

    <select bind:value={selected} on:change={example}>
        {#each examples as e}
            <option value={e} disabled={e.disabled}>{e.name}</option>
        {/each}
    </select>
</div>

<style>
    div.header {
        top: 0;
        height: 30px;
        background-color: #151515;
        padding: 5px 10px;
    }

    div.header > .run {
        cursor: pointer;
        display: inline;
    }

    div.header > .share {
        cursor: pointer;
        display: inline;
        padding: 0 10px;
    }

    div.header > select {
        display: inline;
        border: none;
        background-color: #151515;
        color: rgb(252, 255, 54);
        font-size: 14px;
        outline: none;
        appearance: none;
        cursor: pointer;
    }

    div.header > select::-ms-expand {
        display: none;
    }

    div.header > select option {
        background-color: #252526;
        outline: none;
        appearance: none;
        cursor: pointer;
    }
</style>
