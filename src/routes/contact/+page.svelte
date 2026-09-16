<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Maria OL — Contact</title>
</svelte:head>

<main>
	<h1>Contact</h1>

	{#if !data.bio}
		<p>Contact details coming soon.</p>
	{:else}
		<ul class="details">
			{#if data.bio.email}
				<li><a href="mailto:{data.bio.email}">{data.bio.email}</a></li>
			{/if}
			{#if data.bio.availabilityNote}
				<li>{data.bio.availabilityNote}</li>
			{/if}
			{#if data.bio.studioLocation}
				<li>{data.bio.studioLocation}</li>
			{/if}
		</ul>
		<p class="note">Full catalogue available by request.</p>
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

	.details {
		list-style: none;
		margin: 0 0 2rem;
		padding: 0;
		line-height: 1.8;
	}

	.details a {
		color: inherit;
	}

	.note {
		opacity: 0.7;
		font-size: 0.9rem;
	}
</style>
