<script>
    const { fade, slide } = require("svelte/transition")
    setTimeout(() => {
        const Loader = document.getElementById("Loader");
        Loader.classList.add("out")
        setTimeout(() => {
            Loader.remove();
        }, 1000);
    }, 3250);
</script>

<div id="Loader">
    <svg tag="svg" viewBox="0 0 22 22" width="430" class="hero-logo" height="430">
        <path
            tag="path"
            d="M 11.5,18.788687 C 9.2628645,14.634721 4.7885936,9.4422626 3.670026,9.4422626 c 3.3557031,-4.1539661 0,0 3.3557031,-4.1539661 0,3.1154747 2.2371354,4.1539661 4.4742709,7.2694405 2.237135,-3.1154744 4.474271,-4.1539658 4.474271,-7.2694405 3.355703,4.1539661 0,0 3.355703,4.1539661 -1.118568,0 -5.592839,5.1924584 -7.829974,9.3464244 m 0,-9.3464244 c 1.118568,-1.0384914 2.237135,-2.076983 3.355703,-5.1924577 L 13.737135,3.2113134 C 12.618568,6.326788 11.5,6.326788 11.5,7.3652796 11.5,6.326788 10.381432,6.326788 9.2628645,3.2113134 L 8.1442968,4.2498049 C 9.2628645,7.3652796 10.381432,8.4037712 11.5,9.4422626 Z"
        ></path>
    </svg>
</div>

<style>
    :root {
        --primary: #040404;
        --secondary: #333333;
        --tertiary: #2b2b2e;
        --bgColor: #16133c;
        --accent: #5968eb;
        --accentGlow: #2f3dbb;
        --linkAccent: #5968eb;
        --text: rgb(204, 204, 204);
    }

    @keyframes mainLogo {
        from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            filter: drop-shadow(0px 0px 0.7px var(--accentGlow));
        }

        to {
            stroke-dashoffset: 800;
            filter: drop-shadow(0px 0px 0 var(--accentGlow));
        }
    }
    @keyframes mainLogoFill {
        0% {
            fill: transparent;
        }

        25% {
            fill: transparent;
        }

        50% {
            fill: var(--accent);
        }
    }

    #Loader {
        transition: all 1s ease;
        position: absolute;
        width: 100%;
        height: 100%;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: linear-gradient(10deg, #040404, #16133c);
    }

    #Loader svg {
        transition: all 0.2s ease;
        width: 300px;
        height: 300px;
    }
    
    #Loader svg path {
        stroke: var(--accent);
        stroke-width: 0.2px;
        fill: var(--accent);
        stroke-linecap: round;
        stroke-linejoin: round;
        animation: mainLogo 10s ease, mainLogoFill 8s ease;
        transform: translateX(-0.5px);
        transition: fill 0.3s ease;
    }
</style>