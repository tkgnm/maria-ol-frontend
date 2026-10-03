<script lang="ts">
	import { formatEventDate, formatMonthYear } from '$lib/format';
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

	{#each [{ title: 'Residencies & Courses', items: data.residenciesAndCourses }, { title: 'Exhibitions', items: data.exhibitions }] as section (section.title)}
		{#if section.items.length > 0}
			<section>
				<h2>{section.title}</h2>
				<ul>
					{#each section.items as event (event.id)}
						<li>
							{event.venue ?? event.title}{#if event.venue && event.venue !== event.title}, {event.title}{/if}{#if event.location},
								{event.location}{/if}
							– {formatEventDate(event.startDate, event.endDate)}
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	{/each}

	{#if data.awards.length > 0}
		<section>
			<h2>Awards</h2>
			<ul>
				{#each data.awards as award (award.id)}
					<li>
						{award.title}{#if award.organization}, {award.organization}{/if}{#if award.location}, {award.location}{/if}{#if award.date}
							– {formatMonthYear(award.date)}{/if}
					</li>
				{/each}
			</ul>
		</section>
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

	section {
		margin-top: 3rem;
	}

	h2 {
		font-size: 1.1rem;
		font-weight: 400;
		font-style: italic;
		margin: 0 0 0.75rem;
	}

	section ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	section li {
		line-height: 1.5;
		margin-bottom: 0.4rem;
	}

	@media (max-width: 700px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
</style>
