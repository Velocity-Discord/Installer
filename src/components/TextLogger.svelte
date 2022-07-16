<script>
    const path = require("path")
    import { fileLogs, installLogs, logNewLine } from "../stores/logs"
    import ProgressBar from "./ProgressBar.svelte"

    export let value
    export let title
    export let full
</script>

<section>
    <p>
        {title}
        <br> <br>
        {#each $value as log}
            {log}
            <br><br>
        {/each}
        <!-- {$value.join("\n")} -->
    </p>
    <ProgressBar />
</section>

<style>
    section {
        background-color: #0f0f0f;
        display: flex;
        width: 90%;
        height: 200px;
        padding: 5px;
        box-sizing: border-box;
        overflow-y: scroll;
        overflow-x: hidden;
        text-overflow: ellipsis;
        font-family: monospace;
        border-radius: 4px;
    }

    ::-webkit-scrollbar {
    	width: 6px;
	}

	::-webkit-scrollbar-thumb {
		border: 1px solid #0f0f0f;
		background: rgb(46, 46, 46);
		border-radius: 12px;
		margin: 0px auto;
	}
</style>

{#if full}
<style>
    section {
        height: 290px !important;
    }
</style>
{/if}