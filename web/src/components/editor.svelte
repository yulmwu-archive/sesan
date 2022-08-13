<script lang="ts">
    import { toggleSidebar } from '../stores';

    let toggle = false;
    toggleSidebar.subscribe((v) => (toggle = v));
</script>

<div
    class="w-full {toggle
        ? 'h-3/4 md:w-3/4'
        : 'h-full'} md:h-full float-left dark:bg-background bg-background-light"
>
    <div
        class="w-full h-full dark:bg-background bg-background-light"
        id="editor"
    />
</div>
