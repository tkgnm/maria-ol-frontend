<script lang="ts">
	import { mediaUrl } from '$lib/media';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const portrait = $derived(mediaUrl(data.bio?.portrait));
</script>

<svelte:head>
	<title>Maria OL — Bio</title>
</svelte:head>

<main>
	<h1>Bio</h1>

	{#if !data.bio}
		<p>Bio coming soon.</p>
	{:else}
		<div class="layout">
			{#if portrait}
				<img class="portrait" src={portrait} alt={data.bio.name ?? 'Portrait'} />
			{/if}
			{#if data.bio.statement}
				<div class="statement">
					{#each data.bio.statement.split('\n\n') as paragraph (paragraph)}
						<p>{paragraph}</p>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	h1 {
		font-weight: 400;
		font-style: italic;
		margin-bottom: 2rem;
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
		gap: 3rem;
		align-items: start;
	}

	.portrait {
		width: 100%;
		height: auto;
		display: block;
	}

	.statement p {
		line-height: 1.5;
		margin: 0 0 1.25em;
	}

	@media (max-width: 700px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
</style>
