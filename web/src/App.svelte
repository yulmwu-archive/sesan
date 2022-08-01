<script lang="ts">
    import Header from './components/header.svelte';
    import Editor from './components/editor.svelte';
    import Results from './components/sidebar.svelte';
    import Footer from './components/footer.svelte';
</script>

<div class="absolute w-full h-full pb-12">
    <Header />
    <Editor />
    <Results />
    <Footer />
</div>

<style global lang="postcss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    @layer base {
        * {
            font-family: 'Fira Code', sans-serif;
            color: white;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            -ms-box-sizing: border-box;
            -o-box-sizing: border-box;
        }
    }

    body {
        @apply bg-background;
    }

    *::-webkit-scrollbar {
        @apply w-[10px];
    }

    *::-webkit-scrollbar-thumb {
        @apply bg-header;
    }

    *::-webkit-scrollbar-track,
    *::-webkit-scrollbar-track:hover,
    *::-webkit-scrollbar-corner {
        @apply bg-sidebar;
    }
</style>
