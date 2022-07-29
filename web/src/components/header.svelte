<script lang="ts">
    import { results, evaluating, errors } from '../stores';
    import { editor } from '../main';
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
                        // @ts-ignore
                        editor.getValue()
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
        {
            name: 'Function',
            source: 'function.tiny',
        },
        {
            name: 'If',
            source: 'if.tiny',
        },
        {
            name: 'While',
            source: 'while.tiny',
        },
        {
            name: 'Import',
            source: 'import.tiny',
        },
        {
            name: 'Variable',
            source: 'variable.tiny',
        },
        {
            name: 'Operators',
            source: 'operators.tiny',
        },
        {
            name: 'Decorators',
            source: 'decorators.tiny',
        },
        {
            name: 'Standard Library - IO',
            source: '/stdlib/io.tiny',
        },
        {
            name: 'Standard Library - Array',
            source: '/stdlib/array.tiny',
        },
        {
            name: 'Standard Library - Utility',
            source: '/stdlib/util.tiny',
        },
        {
            name: 'Standard Library - Object',
            source: '/stdlib/object.tiny',
        },
    ];

    let selected = examples[0];
    let exampleOptions: HTMLSelectElement;

    const example = () => {
        exampleOptions.options[0].selected = true;

        axios
            .get(
                `https://raw.githubusercontent.com/tsukiroku/tiny/main/examples/${selected.source}`
            )
            .then((res) => editor.setValue(res.data));
    };

    const share = () => {
        const url = `#${encodeURIComponent(
            // @ts-ignore
            editor.getValue()
        )}`;

        navigator.clipboard.writeText(url);
        window.location.href = url;
    };
</script>

<div class="header">
    <p class="run" on:click={_eval} {disabled}>Run</p>

    <p class="share" on:click={share}>Share</p>

    <p
        class="docs"
        on:click={() => {
            window.open('https://github.com/tsukiroku/tiny/tree/main/docs');
        }}
    >
        Docs
    </p>

    <select
        bind:value={selected}
        on:change={example}
        bind:this={exampleOptions}
    >
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

    div.header > .docs {
        cursor: pointer;
        display: inline;
    }

    div.header > select {
        padding: 0 10px;
        display: inline;
        border: none;
        background-color: #151515;
        color: rgb(252, 255, 54);
        font-size: 15px;
        outline: none;
        appearance: none;
        cursor: pointer;
        width: 100px;
    }

    div.header > select::-ms-expand {
        display: none;
    }

    div.header > select option {
        background-color: #252526;
        outline: none;
        appearance: none;
        cursor: pointer;
        padding: 5px;
    }

    div.header > select option:disabled {
        color: rgb(200, 200, 200);
    }
</style>
