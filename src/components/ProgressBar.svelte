<script>
    import { progress, failed } from "../stores/progress"
</script>

<div style="width: {$progress}%;" class="progress-bar"></div>

<style>
    .progress-bar {
        height: 5px;
        display: flex;
        transition: all 0.3s ease;
        max-width: 90% !important;
        background: var(--linkAccent);
        position: absolute;
        bottom: 0;
        left: 0;
        margin-inline: 5%;
    }

    .progress-bar[style="width: 100%;"] {
        background: #7feb7f !important;
    }
</style>

{#if $failed}
    <style>
        .progress-bar {
            background: #eb7f7f !important;
        }
    </style>
{/if}