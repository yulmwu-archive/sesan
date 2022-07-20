<!-- <script>
    import axios from 'axios';

    let x = '';
    let result = '';

    const _eval = async (x) => {
        return await (
            await axios.get(
                `https://tiny-tsukiroku.vercel.app/eval/${encodeURIComponent(
                    x
                )}`
            )
        ).data.result;
    };
</script>

<main>
    <textarea on:input={(e) => (x = e.target.value)} class="input" />
    <button
        on:click={() => {
            _eval(x).then((r) => (result = r.join('\n')));
        }}
    >
        Eval
    </button>
    <textarea class="output" value={result} />
</main>

<style>
    .input {
        width: 100%;
        height: 70vh;
    }

    .output {
        width: 100%;
        height: 20vh;
    }
</style> -->
<script>
    import Header from './components/header.svelte';
    import Editor, { editor } from './components/editor.svelte';
    import Results from './components/results.svelte';
    import Footer from './components/footer.svelte';
    import { onMount } from 'svelte';

    onMount(() => editor.focus());
</script>

<div class="container">
    <Header />
    <Editor />
    <Results />
    <Footer />
</div>

<style>
    div.container {
        position: absolute;
        width: 100%;
        height: 100%;
        padding-bottom: 50px;
    }
</style>
