<script lang="ts">
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
