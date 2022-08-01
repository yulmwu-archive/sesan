<script lang="ts">
    import { results, evaluating, errors } from '../stores';
    import { editor, examples } from '../main';
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

    let selected = examples[0];
    let exampleOptions: HTMLSelectElement;

    const updateExample = () => {
        exampleOptions.options[0].selected = true;

        axios
            .get(
                `https://raw.githubusercontent.com/tsukiroku/tiny/main/examples/${selected.source}`
            )
            .then((res) => editor.setValue(res.data));
    };
</script>

<div class="top-0 h-8 bg-header pl-1.5 pt-1.5">
    <p class="cursor-pointer inline pl-3" on:click={evaluate} {disabled}>Run</p>

    <p
        class="cursor-pointer inline pl-3"
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
        class="cursor-pointer inline pl-3"
        on:click={() => {
            window.open('https://github.com/tsukiroku/tiny#documentation');
        }}
    >
        Docs
    </p>

    <select
        bind:value={selected}
        on:change={updateExample}
        bind:this={exampleOptions}
        class="pb-2.5 pl-3 inline border-none bg-header outline-none appearance-none cursor-pointer"
    >
        {#each examples as e}
            <option value={e} disabled={e.disabled}>{e.name}</option>
        {/each}
    </select>
</div>
