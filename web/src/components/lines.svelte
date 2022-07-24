<script lang="ts">
    import { line, scrollTop } from '../stores';

    let lines: HTMLElement = null;

    line.subscribe((value: number) => {
        if (!lines) return;

        const res: Array<string> = [];

        [...Array(value).keys()].forEach((i) =>
            res.push(`<div class="line">${i + 1}</div>`)
        );

        lines.innerHTML = res.join('');
    });

    scrollTop.subscribe((value) => {
        if (!lines) return;

        lines.scrollTop = value;
    });
</script>

<div class="lines" bind:this={lines} />

<style>
    div.lines {
        height: 97.5%;
        width: 3%;
        float: left;
        font-size: 14px;
        overflow: hidden;
        padding-right: 12px;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        text-align: center;
    }
</style>
