<script>
    import { results, evaluating } from '../stores';
    import { editor } from './editor.svelte';
    import axios from 'axios';

    let disabled = false;

    evaluating.subscribe((v) => (disabled = !v));

    const _eval = async () => {
        if (disabled) {
            evaluating.update(() => true);

            try {
                const res = await (
                    await axios.get(
                        `https://tiny-tsukiroku.vercel.app/eval/${encodeURIComponent(
                            editor.value
                        )}`
                    )
                ).data;

                results.update(() => res);
            } catch (e) {
                results.update(() => ({
                    errors: [
                        `[Evaluating] ${e.message}, Check if the code is an infinite loop.`,
                    ],
                }));
            }

            evaluating.update(() => false);
        } else {
            results.update(() => ({
                errors: ['Evaluating...'],
            }));
        }
    };

    const examples = [
        {
            id: '1',
            name: 'Hello, World!',
            code: `func hello(name) {
    return "Hello, " + name + "!";
}

println(hello('World'));`,
        },
        {
            id: '2',
            name: 'Fibonacci',
        },
    ];

    let selected = 'placeholder';

    const example = () => (editor.value = selected.code);

    const share = () =>
        (window.location = `#${encodeURIComponent(editor.value)}`);
</script>

<div class="header">
    <p class="run" on:click={_eval} {disabled}>Run</p>

    <p class="share" on:click={share}>Share</p>

    <select bind:value={selected} on:change={example}>
        <option value="placeholder" disabled selected>Examples</option>

        {#each examples as e}
            <option value={e}>{e.name}</option>
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
</style>
