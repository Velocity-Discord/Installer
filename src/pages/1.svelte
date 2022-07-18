<script>
	const electron = require("electron");
	const path = require("path");
	
	import { fileLogs, logNewLine, clearAllLogs } from "../stores/logs"
	import { getPath, openDialog } from "../common/path"
	import pageSlide from "../transitions/pageSlide.js"
	import StatusLabel from "../components/StatusLabel.svelte"
	import PathSelector from "../components/PathSelector.svelte"
	import {onMount} from "svelte";
	import { forward, backward, next, location, action } from "../stores/locations"
	import { savedPath, velocityPath } from "../stores/path"

	let appPath
	let velocityDirPath

		let statusProps = {
		status: ""
	};

	let statusPropsDir = {
		status: ""
	};

	onMount(async () => {
		forward.set(false)
		backward.set(false)
		location.set("/1")
		action.set("Next")
		next.set("/2")
		appPath = $savedPath
		velocityDirPath = $velocityPath

		if ($savedPath && $velocityPath) {
			forward.set(true)
		}
	})

	async function handleClick() {
		appPath = await getPath({sprops: statusProps})
		if (!appPath) return;
	 	if (appPath.includes("Discord") && appPath.toLowerCase().includes("resources")) statusProps.status = "ok";
		else if (appPath.includes("Discord") || appPath.toLowerCase().includes("resources")) statusProps.status = "questionable";
		else statusProps.status = "bad";

		savedPath.set(appPath)
		if ($velocityPath) forward.set(true)
 
		clearAllLogs(fileLogs)

		logNewLine(fileLogs, path.join(appPath, "app/"));
		logNewLine(fileLogs, path.join(appPath, "app/index.js"));
		logNewLine(fileLogs, path.join(appPath, "app/package.json"));
	}

	async function handleClick1() {
		velocityDirPath = await openDialog()
		if (!velocityDirPath) return;

		console.log("Eee")

		velocityPath.set(velocityDirPath)
		if (appPath) forward.set(true)
	}
</script>

<main in:pageSlide out:pageSlide="{{out: true}}">
	<h1>Install Velocity</h1>

	<PathSelector pathStore={savedPath} Title="Discord" {handleClick} {statusProps} ButtonLabel="Browse"/>
	<PathSelector pathStore={velocityPath} Title="Velocity Folder" handleClick={handleClick1} statusProps={statusPropsDir} ButtonLabel="Browse"/>
</main>
