<script lang="ts">
    import { prevent_default } from 'svelte/internal';
import { results, errors } from '../stores';

    let sidebar: string;

    results.subscribe((v) => {
        if (v.errors.length > 0) {
            errors.update(() => (v.errors ?? []).length);

            sidebar = (v.errors ?? []).join('\n');
        } else sidebar = (v.result ?? []).join('\n');
    });
</script>

<div class="w-full h-full float-none md:w-1/4 md:float-right dark:bg-background bg-background-light">
    <textarea
        class="h-1/4 w-full border-none dark:bg-background bg-background-light dark:text-white text-black resize-none outline-none break-words whitespace-pre overflow-x-scroll p-4 md:h-full disabled"
        bind:value={sidebar}
        disabled
    />
</div>
