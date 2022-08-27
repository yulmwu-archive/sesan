<script lang="ts">
    import { results, evaluating, errors, ast, toggleSidebar } from '../stores'
    import { editor, examples } from '../main'
    import type { IExamples } from '../types'
    import axios from 'axios'

    let disabled = false

    evaluating.subscribe((v) => (disabled = !v))

    const evaluate = () => {
        if (disabled) {
            evaluating.update(() => true)
            errors.update(() => 0)

            axios
                .get(`https://sesan-lang.vercel.app/eval/${encodeURIComponent(editor.getValue())}`)
                .then((res) => {
                    console.log(res.data)

                    results.update(() => res.data)

                    document.title = res.data.title ?? 'Sesan Playground'
                })
                .catch((err) =>
                    results.update(() => ({
                        result: [],
                        errors: [`[Evaluating] ${err}, Check if the code is an infinite loop.`],
                        ast: '',
                    }))
                )
                .finally(() => evaluating.update(() => false))
        } else
            results.update(() => ({
                result: [],
                errors: ['Evaluating...'],
                ast: '',
            }))

        toggleSidebar.update(() => true)
    }

    let selected: IExamples | string

    const updateExample = () => {
        if (typeof selected === 'string') return

        axios.get(`https://raw.githubusercontent.com/tsukiroku/sesan/main/examples/${selected.source}`).then((res) => editor.setValue(res.data))

        selected = 'examples'
    }

    let subMenu: string

    const subMenuEvent = () => {
        switch (subMenu) {
            case 'ast': {
                const astJson = JSON.stringify($results.ast, null, 2)

                ast.update(() => (astJson === '""' ? '' : astJson))

                break
            }

            case 'sidebar':
                toggleSidebar.update(() => !$toggleSidebar)
        }

        subMenu = 'subMenu'
    }
</script>

<div class="top-0 h-8 dark:bg-header bg-header-light dark:text-white text-black pl-1.5 pt-1">
    <p class="cursor-pointer inline pl-3 dark:text-white text-black" on:click={evaluate} {disabled}>Run</p>

    <p
        class="cursor-pointer inline pl-3 dark:text-white text-black"
        on:click={() =>
            navigator.clipboard.writeText(`https://tsukiroku.github.io/tiny/${(window.location.href = `#${encodeURIComponent(editor.getValue())}`)}`)}
    >
        Share
    </p>

    <p class="cursor-pointer inline pl-3 dark:text-white text-black" on:click={() => window.open('https://github.com/tsukiroku/tiny#documentation')}>
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

    <select bind:value={subMenu} on:change={subMenuEvent} class="inline border-none bg-transparent outline-none appearance-none cursor-pointer w-12">
        <option value="subMenu" disabled class="dark:bg-sidebar bg-sidebar-light">...</option>
        <optgroup label="Run" class="dark:bg-sidebar bg-sidebar-light">
            <option value="ast" class="dark:bg-sidebar bg-sidebar-light">Show AST (Available after run)</option>
        </optgroup>
        <optgroup label="Output" class="dark:bg-sidebar bg-sidebar-light">
            <option value="sidebar" class="dark:bg-sidebar bg-sidebar-light">Toggle Sidebar (output)</option>
        </optgroup>
    </select>
</div>
