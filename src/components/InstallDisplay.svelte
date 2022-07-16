<script>
    const path = require("path")
    import TextLogger from "./TextLogger.svelte"
    import { finished } from "../stores/path"
    import { fileLogs, installLogs, logNewLine } from "../stores/logs"
    import { onMount } from "svelte";
</script>

<TextLogger value={installLogs} full title={"Installing Velocity"}/>