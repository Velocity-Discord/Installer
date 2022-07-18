<script>
    const path = require("path")
    import { onMount } from "svelte"
    import TextLogger from "./TextLogger.svelte"
    import { fileLogs, installLogs, logNewLine, abc } from "../stores/logs"
    import { velocityPath } from "../stores/path"

    onMount(() => {
        if ($abc) return
        abc.set(true)
		logNewLine(fileLogs, path.join($velocityPath));
		logNewLine(fileLogs, path.join($velocityPath, "/dist/velocity.asar"));
		logNewLine(fileLogs, path.join($velocityPath, "/package.json"));
    })

</script>

<TextLogger value={fileLogs} title={$fileLogs.length + " Locations will be Created/Affected"}/>