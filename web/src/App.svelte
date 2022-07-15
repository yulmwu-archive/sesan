<script>
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
</style>
