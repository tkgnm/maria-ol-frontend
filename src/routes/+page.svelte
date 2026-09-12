<script lang="ts">
	import { mediaUrl } from '$lib/media';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Maria OL — Artworks</title>
</svelte:head>

<main>
	<h1>Artworks</h1>

	{#if data.artworks.length === 0}
		<p>No artworks found.</p>
	{:else}
		<ul class="grid">
			{#each data.artworks as artwork (artwork.id)}
				{@const cover = mediaUrl(artwork.coverImage)}
				<li class="card">
					{#if cover}
						<img src={cover} alt={artwork.coverImage?.alternativeText ?? artwork.title} />
					{/if}
					<div class="info">
						<h2>{artwork.title}</h2>
						{#if artwork.medium}<p class="medium">{artwork.medium}</p>{/if}
						{#if artwork.date}<p class="date">{artwork.date}</p>{/if}
						{#if artwork.location}<p class="location">{artwork.location}</p>{/if}
						{#if artwork.description}<p class="description">{artwork.description}</p>{/if}
						{#if artwork.dimensions.length}
							<ul class="dimensions">
								{#each artwork.dimensions as dim (dim.id)}
									<li>{dim.width ?? '?'} × {dim.height ?? '?'}{dim.depth ? ` × ${dim.depth}` : ''} cm</li>
								{/each}
							</ul>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style>
	main {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1.5rem;
	}

	.grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1.5rem;
	}

	.card {
		display: flex;
		flex-direction: column;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		overflow: hidden;
		background: #fff;
	}

	.card img {
		width: 100%;
		aspect-ratio: 3 / 4;
		object-fit: cover;
		display: block;
		background: #f5f5f5;
	}

	.info {
		padding: 1rem;
	}

	.info h2 {
		font-size: 1.1rem;
		margin: 0 0 0.25rem;
	}

	.info p {
		margin: 0.15rem 0;
		font-size: 0.9rem;
		color: #444;
	}

	.dimensions {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0 0;
		font-size: 0.85rem;
		color: #666;
	}
</style>
