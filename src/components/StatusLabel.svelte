<script>
    export let statusProps

    $: {
        const statusEle = document.getElementById("status")
        if (statusProps.status == "ok") {
            statusEle.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path d="M1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6ZM8.35355 5.10355C8.54882 4.90829 8.54882 4.59171 8.35355 4.39645C8.15829 4.20118 7.84171 4.20118 7.64645 4.39645L5.5 6.54289L4.35355 5.39645C4.15829 5.20118 3.84171 5.20118 3.64645 5.39645C3.45118 5.59171 3.45118 5.90829 3.64645 6.10355L5.14645 7.60355C5.34171 7.79882 5.65829 7.79882 5.85355 7.60355L8.35355 5.10355Z" fill="currentColor"/></svg>Everything looks fine!`
            statusEle.classList.remove("bad")
            statusEle.classList.remove("questionable")
            statusEle.classList.add("ok")
        }
        else if (statusProps.status == "questionable") {
            statusEle.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path d="M6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1ZM6.5 8.5C6.5 8.77614 6.27614 9 6 9C5.72386 9 5.5 8.77614 5.5 8.5C5.5 8.22386 5.72386 8 6 8C6.27614 8 6.5 8.22386 6.5 8.5ZM5 4.75254C5 5.02868 4.77614 5.25254 4.5 5.25254C4.22386 5.25254 4 5.02868 4 4.75254C4 4.16437 4.27218 3.70654 4.67045 3.41047C5.05437 3.12507 5.53998 2.99812 5.99992 2.99805C6.45986 2.99797 6.94547 3.12477 7.32941 3.40998C7.72772 3.70586 8 4.16354 8 4.75158C8 5.18051 7.86473 5.50713 7.63277 5.75804C7.44992 5.95583 7.21523 6.09063 7.05355 6.18349L7.0017 6.2134C6.81473 6.32233 6.70614 6.39758 6.63123 6.49533C6.56831 6.57743 6.5 6.71532 6.5 6.99941C6.5 7.27555 6.27614 7.49941 6 7.49941C5.72386 7.49941 5.5 7.27555 5.5 6.99941C5.5 6.53379 5.61919 6.1719 5.83752 5.88703C6.04386 5.61781 6.31027 5.45889 6.4983 5.34935L6.52577 5.33335C6.72277 5.21865 6.82413 5.15964 6.89848 5.07921C6.94777 5.02589 7 4.94686 7 4.75158C7 4.50385 6.89728 4.3347 6.73309 4.21273C6.55453 4.08009 6.29014 3.998 6.00008 3.99805C5.71002 3.99809 5.44563 4.08026 5.26705 4.21301C5.10282 4.3351 5 4.50446 5 4.75254Z" fill="currentColor"/></svg>We can't tell if that path is a Discord path...`
            statusEle.classList.remove("ok")
            statusEle.classList.remove("bad")
            statusEle.classList.add("questionable")
        }
         else if (statusProps.status == "bad") {
            statusEle.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11ZM7.85355 4.14645C8.04882 4.34171 8.04882 4.65829 7.85355 4.85355L6.70711 6L7.85355 7.14645C8.04882 7.34171 8.04882 7.65829 7.85355 7.85355C7.65829 8.04882 7.34171 8.04882 7.14645 7.85355L6 6.70711L4.85355 7.85355C4.65829 8.04882 4.34171 8.04882 4.14645 7.85355C3.95118 7.65829 3.95118 7.34171 4.14645 7.14645L5.29289 6L4.14645 4.85355C3.95118 4.65829 3.95118 4.34171 4.14645 4.14645C4.34171 3.95118 4.65829 3.95118 4.85355 4.14645L6 5.29289L7.14645 4.14645C7.34171 3.95118 7.65829 3.95118 7.85355 4.14645Z" fill="currentColor"/></svg>This doesn't seem like a Discord path.`
            statusEle.classList.remove("ok")
            statusEle.classList.remove("questionable")
            statusEle.classList.add("bad")
        }
    }
</script>

<p status={statusProps.status} id="status"></p>

<style>
    #status {
        display: flex;
        align-items: center;
        font-size: 12px;
    }

    p {
        margin: 0;
        padding: 0;
    }
</style>