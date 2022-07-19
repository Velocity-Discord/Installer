<script>
    import { actionType } from "../stores/action";

    const updateClasses = () => {
        document.querySelector("#uninstall-action").removeAttribute("selected")
        document.querySelector("#install-action").removeAttribute("selected")
        console.log($actionType)
        $actionType === 2 ? document.querySelector("#install-action").setAttribute("selected", true) : document.querySelector("#uninstall-action").setAttribute("selected", true);
    };
</script>

{#if $actionType == 1}
<label selected="true" id="install-action">
    <input type=radio on:change={updateClasses} bind:group={$actionType} name="install" value={1}>
    Install
</label>
{:else}
<label id="install-action">
    <input type=radio on:change={updateClasses} bind:group={$actionType} name="install" value={1}>
    Install
</label>
{/if}

{#if $actionType == 2}
<label selected="true" id="uninstall-action">
    <input type=radio on:change={updateClasses} bind:group={$actionType} name="uninstall" value={2}>
    Uninstall
</label>
{:else}
<label id="uninstall-action">
    <input type=radio on:change={updateClasses} bind:group={$actionType} name="uninstall" value={2}>
    Uninstall
</label>
{/if}


<style>
    label {
        border: 1px solid rgb(255, 255, 255, 0.1);
        background-color: rgb(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border-radius: 10px;
        padding: 10px;
        width: 80%;
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.1s ease;

        font-size: 16px;
        font-weight: 500;
    }

    label:hover {
        background-color: rgb(255, 255, 255, 0.08);
    }

    label[selected="true"] {
        border: 1px solid rgb(255, 255, 255, 0.1);
        background-color: rgb(53, 80, 236);
        color: rgb(233, 233, 233);
    }

    input {
        display: none;
    }
</style>