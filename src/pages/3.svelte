<script>
	const fs = require("fs");
	const path = require("path");

	import FileDisplay from "../components/FileDisplay.svelte"
	import pageSlide from "../transitions/pageSlide.js"
	import {onMount} from "svelte";
	import { forward, backward, next, location, action } from "../stores/locations"
	import { savedPath } from "../stores/path"

	onMount(() => {
		forward.set(true)
		backward.set(true)
		action.set("Install")
		location.set("/3")
		next.set("/4")
	})
</script>

<main in:pageSlide out:pageSlide="{{out: true}}">
	<p class="head">Are you sure you want to Install Velocity to <span>{$savedPath}</span></p>

	<FileDisplay />
</main>

<style>
	.head {
		text-align: center;
		line-height: 30px;
		font-size: 20px;
		font-weight: 600;
	}
</style>