<script>
    const electron = require("electron");

    import { onMount } from "svelte";
    import StatusLabel from "../components/StatusLabel.svelte"
    export let Title
    export let ButtonLabel
    export let handleClick
    export let statusProps
    export let pathStore

    onMount(() => {
        pathStore.subscribe(async (path) => {
            let icon = await electron.ipcRenderer.invoke("getIcon", path)
            const current = document.querySelector(`#${Title.toLowerCase().replace(" ", "-")}`)
            if (typeof icon == "string") return current.querySelector(".image").setAttribute("src", icon)

            icon = icon.toDataURL()
            current.querySelector(".image").setAttribute("src", icon)
        })
    })
</script>

<div id={Title.toLowerCase().replace(" ", "-")} class="pathSelector">
    <div class="info">
        <img class="image" src="../assets/Velocity.ico" alt="Icon">
        <div class="details">
            <div class="title">{Title}</div>
            <div class="path">{$pathStore || "No Selected Path"}</div>
            <StatusLabel {statusProps}/>
        </div>
    </div>
    <button id="browseBtn" on:click={handleClick}>{ButtonLabel}</button>
</div>

<style>
    .pathSelector {
        border: 1px solid rgb(255, 255, 255, 0.1);
        background-color: rgb(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border-radius: 10px;
        padding: 10px;
        width: 80%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        overflow: hidden;
    }

    img {
        width: 50px;
        height: 50px;
    }

    .info {
        display: flex;
        gap: 20px
    }

    .details {
        display: flex;
        flex-direction: column;
    }

    .title {
        font-size: 18px;
        font-weight: 500;
    }

    .path {
        font-size: 12px;
        opacity: 0.5;
    }
</style>