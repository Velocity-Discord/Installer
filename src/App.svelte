<script>
	import Loader from "./components/Loader.svelte"
	import TitleBar from "./components/TitleBar.svelte"
	import Footer from "./components/Footer.svelte"
	import Page0 from "./pages/0.svelte"
	import Page1 from "./pages/1.svelte"
	import Page2 from "./pages/2.svelte"
	import Page3 from "./pages/3.svelte"
	import Page4 from "./pages/4.svelte"
	import Router from "svelte-spa-router"

	import { push } from "svelte-spa-router"

	push("/0")
</script>

<TitleBar/>

<Router routes={{
	"/0": Page0,

	"/1": Page1,

	"/2": Page2,

	"/3": Page3,

	"/4": Page4,
}}/>

<Footer />

<Loader/>