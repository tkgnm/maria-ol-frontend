<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const links = [
		{ href: resolve('/'), label: 'Artworks' },
		{ href: resolve('/bio'), label: 'Bio' },
		{ href: resolve('/contact'), label: 'Contact' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class:overlay={page.data.hero != null}>
	<a class="brand" href={resolve('/')}>Maria Ol</a>
	<ul>
		{#each links as link (link.href)}
			<li><a href={link.href}>{link.label}</a></li>
		{/each}
	</ul>
</nav>

{@render children()}

<style>
	nav {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem 1.5rem;
		max-width: 1100px;
		margin: 0 auto;
		padding: 1.5rem 1rem 0;
		font-size: 0.9rem;
	}

	.brand {
		font-style: italic;
		font-size: 1.1rem;
		text-decoration: none;
		color: inherit;
		margin-right: auto;
	}

	nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.25rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	nav a {
		color: inherit;
		text-decoration: none;
		opacity: 0.7;
	}

	nav.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
		max-width: none;
		margin: 0;
		padding: 1.5rem 2rem 3rem;
		color: #fff;
		background: linear-gradient(to bottom, rgb(0 0 0 / 0.55), transparent);
		text-shadow: 0 1px 3px rgb(0 0 0 / 0.5);
	}

	nav a:hover {
		opacity: 1;
		text-decoration: underline;
	}
</style>
