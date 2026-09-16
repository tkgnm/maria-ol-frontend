<script lang="ts">
	import { mediaUrl } from '$lib/media';
	import type { Artwork } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type SizeBucket = 'Small' | 'Medium' | 'Large';

	function sizeBucket(artwork: Artwork): SizeBucket | null {
		const dim = artwork.dimensions[0];
		if (!dim || (dim.width == null && dim.height == null)) return null;
		const maxSide = Math.max(dim.width ?? 0, dim.height ?? 0);
		if (maxSide <= 40) return 'Small';
		if (maxSide <= 100) return 'Medium';
		return 'Large';
	}

	function year(artwork: Artwork): string | null {
		return artwork.date ? artwork.date.slice(0, 4) : null;
	}

	// Filter option lists, derived from the loaded artworks.
	const years = $derived(
		[...new Set(data.artworks.map(year).filter((y): y is string => y !== null))].sort().reverse()
	);
	const sizes: SizeBucket[] = ['Small', 'Medium', 'Large'];
	const tags = $derived(
		[...new Map(data.artworks.flatMap((a) => a.tags).map((t) => [t.documentId, t])).values()].sort(
			(a, b) => a.name.localeCompare(b.name)
		)
	);
	const hasPrices = $derived(data.artworks.some((a) => a.price != null));

	// Filter + sort state.
	let selectedYear = $state('all');
	let selectedSize = $state('all');
	let selectedTag = $state('all');
	let sortBy = $state<'default' | 'year-desc' | 'year-asc' | 'price-asc' | 'price-desc'>('default');

	const filtered = $derived(
		data.artworks.filter((a) => {
			if (selectedYear !== 'all' && year(a) !== selectedYear) return false;
			if (selectedSize !== 'all' && sizeBucket(a) !== selectedSize) return false;
			if (selectedTag !== 'all' && !a.tags.some((t) => t.documentId === selectedTag)) return false;
			return true;
		})
	);

	const sorted = $derived(
		[...filtered].sort((a, b) => {
			switch (sortBy) {
				case 'year-desc':
					return (year(b) ?? '').localeCompare(year(a) ?? '');
				case 'year-asc':
					return (year(a) ?? '').localeCompare(year(b) ?? '');
				case 'price-asc':
					return (a.price ?? Infinity) - (b.price ?? Infinity);
				case 'price-desc':
					return (b.price ?? -Infinity) - (a.price ?? -Infinity);
				default:
					return 0; // already in homepage sortOrder from the server load
			}
		})
	);

	// Group sections: only used when at least one artwork in the filtered set belongs to a group.
	const groupedSections = $derived(
		data.groups
			.map((g) => ({
				group: g,
				artworks: sorted.filter((a) => a.groups.some((ag) => ag.documentId === g.documentId))
			}))
			.filter((section) => section.artworks.length > 0)
	);
	const groupedIds = $derived(new Set(groupedSections.flatMap((s) => s.artworks.map((a) => a.id))));
	const ungrouped = $derived(sorted.filter((a) => !groupedIds.has(a.id)));
	const useGroups = $derived(groupedSections.length > 0);
</script>

<svelte:head>
	<title>Maria OL — Artworks</title>
</svelte:head>

<main>
	<h1>Artworks</h1>

	{#if data.artworks.length === 0}
		<p>No artworks found.</p>
	{:else}
		<div class="controls">
			<label>
				Year
				<select bind:value={selectedYear}>
					<option value="all">All</option>
					{#each years as y (y)}
						<option value={y}>{y}</option>
					{/each}
				</select>
			</label>
			<label>
				Size
				<select bind:value={selectedSize}>
					<option value="all">All</option>
					{#each sizes as s (s)}
						<option value={s}>{s}</option>
					{/each}
				</select>
			</label>
			{#if tags.length > 0}
				<label>
					Tag
					<select bind:value={selectedTag}>
						<option value="all">All</option>
						{#each tags as t (t.documentId)}
							<option value={t.documentId}>{t.name}</option>
						{/each}
					</select>
				</label>
			{/if}
			<label>
				Sort
				<select bind:value={sortBy}>
					<option value="default">Curated order</option>
					<option value="year-desc">Year (newest first)</option>
					<option value="year-asc">Year (oldest first)</option>
					{#if hasPrices}
						<option value="price-asc">Price (low to high)</option>
						<option value="price-desc">Price (high to low)</option>
					{/if}
				</select>
			</label>
		</div>

		{#if sorted.length === 0}
			<p>No artworks match these filters.</p>
		{:else if useGroups}
			{#each groupedSections as section (section.group.documentId)}
				<section class="group">
					<h2>{section.group.title}</h2>
					{#if section.group.description}<p class="group-description">
							{section.group.description}
						</p>{/if}
					{@render artworkGrid(section.artworks)}
				</section>
			{/each}
			{#if ungrouped.length > 0}
				<section class="group">
					<h2>Other works</h2>
					{@render artworkGrid(ungrouped)}
				</section>
			{/if}
		{:else}
			{@render artworkGrid(sorted)}
		{/if}
	{/if}
</main>

{#snippet artworkCard(artwork: Artwork)}
	{@const cover = mediaUrl(artwork.coverImage)}
	<li class="card">
		{#if cover}
			<img src={cover} alt={artwork.coverImage?.alternativeText ?? artwork.title} />
		{/if}
		<div class="info">
			<h3>
				{artwork.title}
				{#if artwork.sold}<span class="badge">Sold</span>{/if}
			</h3>
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
			{#if artwork.price != null && !artwork.sold}
				<p class="price">{artwork.price} {artwork.currency ?? 'EUR'}</p>
			{/if}
			{#if artwork.tags.length}
				<ul class="tags">
					{#each artwork.tags as tag (tag.documentId)}
						<li>{tag.name}</li>
					{/each}
				</ul>
			{/if}
		</div>
	</li>
{/snippet}

{#snippet artworkGrid(artworks: Artwork[])}
	<ul class="grid">
		{#each artworks as artwork (artwork.id)}
			{@render artworkCard(artwork)}
		{/each}
	</ul>
{/snippet}

<style>
	main {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	h1 {
		font-weight: 400;
		font-style: italic;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin: 1.5rem 0 2rem;
		font-size: 0.85rem;
	}

	.controls label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		opacity: 0.8;
	}

	.controls select {
		font: inherit;
		font-size: 0.9rem;
		padding: 0.25rem 0.4rem;
	}

	.group {
		margin-bottom: 3rem;
	}

	.group h2 {
		font-weight: 400;
		font-style: italic;
		font-size: 1.2rem;
		margin-bottom: 0.25rem;
	}

	.group-description {
		opacity: 0.7;
		font-size: 0.9rem;
		margin: 0 0 1.5rem;
		max-width: 60ch;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 2rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.card img {
		width: 100%;
		height: auto;
		display: block;
		margin-bottom: 0.75rem;
	}

	.card h3 {
		font-size: 1rem;
		font-weight: 400;
		margin: 0 0 0.25rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.badge {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.6;
		border: 1px solid currentColor;
		padding: 0.1rem 0.4rem;
	}

	.card p {
		margin: 0 0 0.25rem;
		font-size: 0.9rem;
	}

	.medium,
	.date,
	.location {
		opacity: 0.7;
	}

	.description {
		margin-top: 0.5rem !important;
	}

	.dimensions {
		list-style: none;
		margin: 0.5rem 0 0;
		padding: 0;
		font-size: 0.85rem;
		opacity: 0.7;
	}

	.price {
		margin-top: 0.5rem !important;
		font-weight: 500;
	}

	.tags {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0.6rem 0 0;
		padding: 0;
	}

	.tags li {
		font-size: 0.75rem;
		opacity: 0.7;
		border: 1px solid currentColor;
		padding: 0.1rem 0.4rem;
	}
</style>
