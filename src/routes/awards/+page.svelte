<script lang="ts">
	import { formatMonthYear } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Maria OL — Awards</title>
</svelte:head>

<main>
	<h1>Awards</h1>

	{#if data.awards.length === 0}
		<p>Coming soon.</p>
	{:else}
		<ul class="list">
			{#each data.awards as award (award.id)}
				<li>
					<h2>{award.title}</h2>
					<p class="meta">
						{#if award.organization}{award.organization} ·
						{/if}
						{#if award.date}{formatMonthYear(award.date)}{/if}
						{#if award.location}· {award.location}{/if}
					</p>
					{#if award.description}<p class="description">{award.description}</p>{/if}
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style>
	main {
		max-width: 700px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	h1 {
		font-weight: 400;
		font-style: italic;
		margin-bottom: 2rem;
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.list li {
		margin-bottom: 2rem;
	}

	h2 {
		font-size: 1.1rem;
		font-weight: 400;
		margin: 0 0 0.25rem;
	}

	.meta {
		font-size: 0.85rem;
		opacity: 0.7;
		margin: 0 0 0.5rem;
	}

	.description {
		margin: 0;
		line-height: 1.5;
	}
</style>
