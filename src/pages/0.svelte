<script>
	const electron = require("electron");
	const path = require("path");
	
	import { fileLogs, logNewLine, clearAllLogs } from "../stores/logs"
	import pageSlide from "../transitions/pageSlide.js"
	import {onMount} from "svelte";
	import { forward, backward, next, location, action } from "../stores/locations"
    import ActionRadioGroup from "../components/RadioGroup.svelte"

	onMount(async () => {
		forward.set(true)
		backward.set(false)
		location.set("/0")
		action.set("Next")
		next.set("/1")
	})
</script>

<main in:pageSlide out:pageSlide="{{out: true}}">
	<h1>Velocity</h1>

	<ActionRadioGroup />
</main>
