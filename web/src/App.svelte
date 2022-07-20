<script>
    import Header from './components/header.svelte';
    import Editor, { editor } from './components/editor.svelte';
    import Results from './components/results.svelte';
    import Footer from './components/footer.svelte';
    import { onMount } from 'svelte';

    onMount(() => {
        editor.value = window.location.hash
            ? decodeURIComponent(window.location.hash.substr(1))
            : `// Welcome to the Tiny web interpreter.
// You can check examples from the \`Examples\` menu.
// Click \`Run\` to execute the code. (Cannot run while evaluating)
// Click \`Share\` to share the code. (Copy the URL)
// Enjoy!

println("Hello, World!");`;

        editor.focus();
    });
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
