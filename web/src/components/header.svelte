<script lang="ts">
    import { results, evaluating, errors } from '../stores';
    import { editor, examples } from '../main';
    import type { IExamples } from '../types';
    import axios from 'axios';

    let disabled = false;

    evaluating.subscribe((v) => (disabled = !v));

    const evaluate = () => {
        if (disabled) {
            evaluating.update(() => true);
            errors.update(() => 0);

            axios
                .get(
                    `https://tiny-tsukiroku.vercel.app/eval/${encodeURIComponent(
                        editor.getValue()
                    )}`
                )
                .then((res) => results.update(() => res.data))
                .catch((err) =>
                    results.update(() => ({
                        result: [],
                        errors: [
                            `[Evaluating] ${err}, Check if the code is an infinite loop.`,
                        ],
                    }))
                )
                .finally(() => evaluating.update(() => false));
        } else
            results.update(() => ({
                result: [],
                errors: ['Evaluating...'],
            }));
    };

    let selected: IExamples | string;

    const updateExample = () => {
        if (typeof selected === 'string') return;

        axios
            .get(
                `https://raw.githubusercontent.com/tsukiroku/tiny/main/examples/${selected.source}`
            )
            .then((res) => editor.setValue(res.data));

        selected = 'examples';
    };
</script>

<div class="top-0 h-8 dark:bg-header bg-header-light dark:text-white text-black pl-1.5 pt-1">
    <p class="cursor-pointer inline pl-3 dark:text-white text-black" on:click={evaluate} {disabled}>Run</p>

    <p
        class="cursor-pointer inline pl-3 dark:text-white text-black"
        on:click={() =>
            navigator.clipboard.writeText(
                `${
                    window.location.href
                }${(window.location.href = `#${encodeURIComponent(
                    editor.getValue()
                )}`)}`
            )}
    >
        Share
    </p>

    <p
        class="cursor-pointer inline pl-3 dark:text-white text-black"
        on:click={() =>
            window.open('https://github.com/tsukiroku/tiny#documentation')}
    >
        Docs
    </p>

    <select
        bind:value={selected}
        on:change={updateExample}
        class="pb-2.5 pl-3 inline border-none bg-transparent outline-none appearance-none cursor-pointer w-24"
    >
        <option value="examples" disabled class="dark:bg-sidebar bg-sidebar-light">Examples</option>
        {#each examples as e}
            <optgroup label={e.name} class="dark:bg-sidebar bg-sidebar-light">
                {#each e.examples as e}
                    <option value={e} class="dark:bg-sidebar bg-sidebar-light">{e.name}</option>
                {/each}
            </optgroup>
        {/each}
    </select>
</div>
