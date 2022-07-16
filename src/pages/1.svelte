<script>
	const electron = require("electron");
	const path = require("path");
	
	import { fileLogs, logNewLine, clearAllLogs } from "../stores/logs"
	import { getPath } from "../common/path"
	import pageSlide from "../transitions/pageSlide.js"
	import StatusLabel from "../components/StatusLabel.svelte"
	import {onMount} from "svelte";
	import { forward, backward, next, location, action } from "../stores/locations"
	import { savedPath } from "../stores/path"

	let appPath

	onMount(() => {
		forward.set(false)
		backward.set(false)
		location.set("/1")
		action.set("Next")
		next.set("/2")
		appPath = $savedPath

		if ($savedPath) {
			const pathEle = document.querySelector("span.path");
			pathEle.setAttribute("style", "display: block;");
			if (appPath.includes("Discord") && appPath.toLowerCase().includes("resources")) statusProps.status = "ok";
			else if (appPath.includes("Discord") || appPath.toLowerCase().includes("resources")) statusProps.status = "questionable";
			else statusProps.status = "bad";
			forward.set(true)
		}
	})

	let statusProps = {
		status: ""
	};

	async function handleClick() {
		appPath = await getPath({sprops: statusProps})
		if (!appPath) return;
		const pathEle = document.querySelector("span.path");
    	pathEle.setAttribute("style", "display: block;");
	 	if (appPath.includes("Discord") && appPath.toLowerCase().includes("resources")) statusProps.status = "ok";
		else if (appPath.includes("Discord") || appPath.toLowerCase().includes("resources")) statusProps.status = "questionable";
		else statusProps.status = "bad";

		savedPath.set(appPath)
		forward.set(true)
 
		clearAllLogs(fileLogs)

		logNewLine(fileLogs, path.join(appPath, "app/"));
		logNewLine(fileLogs, path.join(appPath, "app/index.js"));
		logNewLine(fileLogs, path.join(appPath, "app/package.json"));
		logNewLine(fileLogs, path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/"));
		logNewLine(fileLogs, path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/dist/velocity.asar"));
		logNewLine(fileLogs, path.join(await electron.ipcRenderer.invoke("getAppPath"), "VelocityDiscord/package.json"));
	}
</script>

<main in:pageSlide out:pageSlide="{{out: true}}">
	<h1>Install Velocity</h1>

	<button class="lookVibrant" id="browseBtn" on:click={handleClick}>Browse for Discord</button>
	<span class="path" style="display: none;">{$savedPath}</span>
	<StatusLabel {statusProps}/>
</main>
