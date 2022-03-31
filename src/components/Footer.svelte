<script>
    const remote = require("@electron/remote")
    import { push, pop, location } from "svelte-spa-router"
    import {onMount} from "svelte";
	import { state, forward, backward, next, action } from "../stores/locations"

    async function goNext() {
        state.direction = 1;
        if ($next) push($next);
        else remote.app.exit();
    }
    function goBack() {
        state.direction = -1;
        pop();
    }
</script>

<footer class="footer">
    <button class="lookVibrant small" id="backPage" disabled={!$backward} on:click={goBack}>Back</button>
	<button class="lookFill small" id="nextPage" disabled={!$forward} on:click={goNext}>{$action}</button>
</footer>

{#if $action == "Exit"}
    <style>
        .lookFill.small {
            background: #c74545;
        }
    </style>
{/if}