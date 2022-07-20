<script>
    import { results } from '../stores';
    import { editor } from './editor.svelte';
    import axios from 'axios';

    const _eval = async () => {
        const c = await (
            await axios.get(
                `https://tiny-tsukiroku.vercel.app/eval/${encodeURIComponent(
                    editor.value
                )}`
            )
        ).data;

        results.update(() => c);
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

    const example = () => {
        editor.value = selected.code;
    };
</script>

<div class="header">
    <p class="run" on:click={_eval}>Run</p>

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

    div.header > select {
        display: inline;
        border: none;
        background-color: #151515;
        color: rgb(252, 255, 54);
        font-size: 14px;
        outline: none;
        padding: 0 10px;
        appearance: none;
        cursor: pointer;
    }

    div.header > select::-ms-expand {
        display: none;
    }
</style>
