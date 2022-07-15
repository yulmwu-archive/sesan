<script>
    import axios from 'axios';

    let x = '';
    let result = '';

    const _eval = async (x) => {
        console.log(x);
        return axios
            .get(`http://tiny-tsukiroku.vercel.app/eval/${x}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            })
            .then(async (response) => {
                console.log(response);
                response.json().result;
            })
            .catch((error) => {
                console.error(error);
                return error.message;
            });
    };
</script>

<main>
    <textarea on:input={(e) => (x = e.target.value)} class="input" />
    <button
        on:click={() => {
            result = _eval(x);
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
</style>
