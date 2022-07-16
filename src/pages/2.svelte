<script>
	import pageSlide from "../transitions/pageSlide.js"
	import {onMount} from "svelte";
	import { forward, backward, next, location, action } from "../stores/locations"
	import { savedPath } from "../stores/path"

	let checkboxEle;
	let checked = false;

	onMount(() => {
		forward.set(false)
		backward.set(true)
		action.set("Next")
		location.set("/2")
		next.set("/3")
	})

	function check(event) {
		checkboxEle.checked = !checkboxEle.checked
		const changeEvent = new Event("change");
		checkboxEle.dispatchEvent(changeEvent);
	}

	function accept(event) {
		if (event.target.checked) return forward.set(true)
		forward.set(false)
	}
</script>

<main in:pageSlide out:pageSlide="{{out: true}}">
	<p class="head">License</p>

	<section>
		<p>
			MIT License <br> <br>

			Copyright (c) 2022 <br> <br>

			Permission is hereby granted, free of charge, to any person obtaining a copy
			of this software and associated documentation files (the "Software"), to deal
			in the Software without restriction, including without limitation the rights
			to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
			copies of the Software, and to permit persons to whom the Software is
			furnished to do so, subject to the following conditions:  <br> <br>

			The above copyright notice and this permission notice shall be included in all
			copies or substantial portions of the Software.  <br> <br>

			THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
			IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
			FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
			AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
			LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
			OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
			SOFTWARE.  <br> <br>
		</p>
	</section>

	<!-- BetterDiscord's Method -->
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="accept-container" on:click={check}>
		<div class="accept-inner">
			<input type="checkbox" name="license"  bind:checked bind:this={checkboxEle} id="license-check" on:change={accept}>
			<svg viewBox="-1 -1 13 13" xmlns="http://www.w3.org/2000/svg" width="10" height="10">
				<path fill="currentColor" d="M 0 2 C -1 1 1 -1 2 0 L 12 10 C 13 11 11 13 10 12 M 2 12 C 1 13 -1 11 0 10 L 10 0 C 11 -1 13 1 12 2"></path>
			</svg>
		</div>
		<label for="license">I Accept the License</label>
	</label>
</main>

<style>
	.head {
		text-align: center;
		line-height: 30px;
		font-size: 20px;
		font-weight: 600;
	}

	.accept-inner {
		display: flex;
		width: fit-content;
		height: fit-content;
		align-items: center;
		justify-content: center;
	}

	svg {
		position: absolute;
		opacity: 0;
		transform: translateX(-0.2px);
	}

	#license-check:checked + svg {
		opacity: 1;
	}

	.accept-container {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	.accept-container * {
		cursor: pointer;
	}

	#license-check {
		background: #1A1C2E;
		appearance: none;
		border: none;
		outline: none;
		cursor: pointer;
		margin: 0;
		height: fit-content;
		transition: all 0.2s ease;
		width: 15px;
		height: 15px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	#license-check:checked {
		background: rgb(53, 80, 236);
		border: none;
		outline: none;
	}

	label {
		font-size: 13px;
		font-weight: 500;
	}

    section {
        background-color: #0f0f0f;
        display: flex;
        width: 90%;
        height: 200px;
        padding: 5px;
        box-sizing: border-box;
        overflow-y: scroll;
        overflow-x: hidden;
        text-overflow: ellipsis;
        font-family: monospace;
		margin-bottom: 10px;
		border-radius: 4px;
    }

    ::-webkit-scrollbar {
    	width: 6px;
	}

	::-webkit-scrollbar-thumb {
		border: 1px solid #0f0f0f;
		background: rgb(46, 46, 46);
		border-radius: 12px;
		margin: 0px auto;
		cursor: pointer;
	}
</style>