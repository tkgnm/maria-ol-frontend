<script lang="ts">
	import { formatEventDate } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Maria OL — Courses</title>
</svelte:head>

<main>
	<h1>Courses</h1>

	{#if data.events.length === 0}
		<p>No courses listed yet — check back soon.</p>
	{:else}
		<ul class="list">
			{#each data.events as event (event.id)}
				<li>
					<h2>{event.title}</h2>
					<p class="meta">
						{formatEventDate(event.startDate, event.endDate)}
						{#if event.venue}· {event.venue}{/if}
						{#if event.location}· {event.location}{/if}
					</p>
					{#if event.description}<p class="description">{event.description}</p>{/if}
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
