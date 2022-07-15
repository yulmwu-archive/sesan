<script>
    let x = 'asdf';
</script>

<main>
    <textarea on:input={(e) => (x = e.target.value)} class="input" />
</main>

<button
    on:click={() => {
        console.log(x);
    }}
>
    Eval
</button>

<style>
    .input {
        width: 100%;
        height: 70vh;
    }
</style>
