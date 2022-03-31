<script>
    const { app } = require("@electron/remote")
    const path = require("path")
    import TextLogger from "./TextLogger.svelte"
    import { fileLogs, installLogs, logNewLine } from "../stores/logs"

</script>

<TextLogger value={fileLogs} title={$fileLogs.length + " Directories will be Created/Affected"}/>