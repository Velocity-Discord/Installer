<script>
	const fs = require("fs");
	const path = require("path");

	import InstallDisplay from "../components/InstallDisplay.svelte"
	import pageSlide from "../transitions/pageSlide.js"
	import {onMount, onDestroy} from "svelte";
	import { forward, backward, next, location, action } from "../stores/locations"
	import { savedPath, finished, installing } from "../stores/path"
	import { startInstall } from "../common/install";

	onMount(() => {
		forward.set(false)
		backward.set(false)
		action.set("Installing...")
		location.set("/4")
		next.set()
		installing.set(true)
	})

	const us = installing.subscribe(value => {
		if (value == true) {
			setTimeout(() => {
				startInstall()
			}, 500);
		}
	})

	const unsubscribe = finished.subscribe(value => {
		if (value == true) {
			forward.set(true)
			action.set("Done")
		}
	});

	onDestroy(unsubscribe, us);
</script>

<main in:pageSlide out:pageSlide="{{out: true}}">
	<InstallDisplay />
</main>