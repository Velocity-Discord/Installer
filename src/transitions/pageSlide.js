import { state } from "../stores/locations";
import { quartInOut } from "svelte/easing";

// Directly from the betterdiscord installer
export default function page(node, { delay = 0, duration = 300, easing = quartInOut, x = 550, out = false }) {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;

    const direction = out ? -1 : 1;
    x = direction * x;
    x = state.direction * x;

    return {
        delay,
        duration,
        easing,
        css: (t) => {
            return `transform: ${transform} translateX(${(1 - t) * x}px);`;
        },
    };
}
