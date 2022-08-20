<script lang="ts">
    import { results, errors, ast, toggleSidebar } from '../stores';

    let sidebar: string;

    results.subscribe((v) => {
        if (v.errors.length > 0) {
            errors.update(() => v.errors.length);

            sidebar = v.errors.join('\n');
        } else sidebar = v.result.join('');
    });

    ast.subscribe((v) => (sidebar = v));

    let toggle = false;
    toggleSidebar.subscribe((v) => (toggle = v));
</script>

<div
    class={toggle
        ? 'w-full h-full float-none md:w-1/4 md:float-right dark:bg-background bg-background-light'
        : ''}
>
    <textarea
        class="h-1/4 w-full border-none dark:bg-background bg-background-light dark:disabled:text-white disabled:text-black resize-none outline-none break-words whitespace-pre overflow-x-scroll p-4 md:h-full"
        bind:value={sidebar}
        disabled
    />
</div>
