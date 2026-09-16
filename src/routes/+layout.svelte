<script lang="ts">
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const links = [
		{ href: resolve('/'), label: 'Artworks' },
		{ href: resolve('/bio'), label: 'Bio' },
		{ href: resolve('/upcoming'), label: 'Upcoming' },
		{ href: resolve('/exhibitions'), label: 'Residencies & Exhibitions' },
		{ href: resolve('/courses'), label: 'Courses' },
		{ href: resolve('/awards'), label: 'Awards' },
		{ href: resolve('/contact'), label: 'Contact' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
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

	nav a:hover {
		opacity: 1;
		text-decoration: underline;
	}
</style>
