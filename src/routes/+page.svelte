<script lang="ts">
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { largeMediaUrl, mediaUrl } from '$lib/media';
	import type { Artwork, ArtworkGroup } from '$lib/types';
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

	// Lightbox.
	let lightboxArtwork = $state<Artwork | null>(null);

	// Hero banner (decided server-side so the nav styling matches the prerendered HTML).
	const heroArtwork = $derived(
		data.hero ? (data.artworks.find((a) => a.id === data.hero!.artworkId) ?? null) : null
	);

	function mode(group: ArtworkGroup) {
		// Hero only applies to the group chosen by the server; any other falls back to grid.
		if (group.displayMode === 'hero')
			return group.documentId === data.hero?.groupId ? 'hero' : 'grid';
		return group.displayMode ?? 'grid';
	}

	function scrollCarousel(e: MouseEvent, direction: 1 | -1) {
		const track = (e.currentTarget as HTMLElement).parentElement?.querySelector('.track');
		track?.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
	}

	// Group sections: only used when at least one artwork in the filtered set belongs to a group.
	const groupedSections = $derived(
		data.groups
			.map((g) => ({
				group: g,
				artworks: sorted.filter(
					(a) =>
						a.groups.some((ag) => ag.documentId === g.documentId) &&
						// The hero artwork is shown in the banner instead of the grid.
						!(g.documentId === data.hero?.groupId && a.id === data.hero.artworkId)
				)
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

{#if heroArtwork && data.hero}
	{@const heroGroup = data.groups.find((g) => g.documentId === data.hero?.groupId)}
	<button class="hero" type="button" onclick={() => (lightboxArtwork = heroArtwork)}>
		<img
			src={largeMediaUrl(heroArtwork.coverImage)}
			alt={heroArtwork.coverImage?.alternativeText ?? heroArtwork.title}
		/>
		<span class="hero-caption">
			<span class="hero-title">{heroGroup?.title ?? heroArtwork.title}</span>
			{#if heroGroup?.description}<span class="hero-sub">{heroGroup.description}</span>{/if}
		</span>
	</button>
{/if}

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
					{#if mode(section.group) === 'immersive'}
						{@render immersive(section.artworks)}
					{:else}
						{@render artworkGrid(section.artworks, section.group)}
					{/if}
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

{#snippet artworkCard(artwork: Artwork, boosted: boolean)}
	{@const cover = mediaUrl(artwork.coverImage)}
	<li class="card" class:boosted>
		<button type="button" class="open" onclick={() => (lightboxArtwork = artwork)}>
			{#if cover}
				<img
					src={boosted ? largeMediaUrl(artwork.coverImage) : cover}
					alt={artwork.coverImage?.alternativeText ?? artwork.title}
				/>
			{/if}
			<span class="caption">
				{artwork.title}
				{#if artwork.sold}<span class="badge">Sold</span>{/if}
			</span>
		</button>
	</li>
{/snippet}

{#snippet artworkGrid(artworks: Artwork[], group?: ArtworkGroup)}
	{@const boostedIds = new Set(group?.boostedArtworks?.map((b) => b.documentId))}
	<ul class="grid">
		{#each artworks as artwork (artwork.id)}
			{@render artworkCard(artwork, boostedIds.has(artwork.documentId))}
		{/each}
	</ul>
{/snippet}

{#snippet immersive(artworks: Artwork[])}
	<div class="immersive">
		<ul class="track">
			{#each artworks as artwork (artwork.id)}
				<li>
					<button type="button" class="open" onclick={() => (lightboxArtwork = artwork)}>
						<img
							src={largeMediaUrl(artwork.coverImage)}
							alt={artwork.coverImage?.alternativeText ?? artwork.title}
						/>
					</button>
				</li>
			{/each}
		</ul>
		{#if artworks.length > 1}
			<button
				type="button"
				class="nav prev"
				aria-label="Previous"
				onclick={(e) => scrollCarousel(e, -1)}>‹</button
			>
			<button type="button" class="nav next" aria-label="Next" onclick={(e) => scrollCarousel(e, 1)}
				>›</button
			>
		{/if}
	</div>
{/snippet}

<Lightbox
	artwork={lightboxArtwork}
	email={data.contactEmail}
	onclose={() => (lightboxArtwork = null)}
/>

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
		grid-auto-flow: dense;
		gap: 2rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.open {
		display: block;
		width: 100%;
		padding: 0;
		border: none;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: zoom-in;
	}

	.card img {
		width: 100%;
		height: auto;
		display: block;
		margin-bottom: 0.5rem;
	}

	.card.boosted {
		grid-column: span 2;
		grid-row: span 2;
	}

	@media (max-width: 560px) {
		.card.boosted {
			grid-column: span 1;
			grid-row: span 1;
		}
	}

	.caption {
		font-size: 1rem;
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

	/* Immersive: full-bleed, no padding; scroll-snap carousel when there are several. */
	.immersive {
		position: relative;
		width: 100vw;
		margin-left: calc(50% - 50vw);
	}

	.track {
		display: flex;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.track li {
		flex: 0 0 100%;
		scroll-snap-align: start;
	}

	.track img {
		width: 100%;
		height: auto;
		display: block;
	}

	.nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		font-size: 2.5rem;
		line-height: 1;
		padding: 0.2rem 0.8rem;
		border: none;
		background: rgb(0 0 0 / 0.35);
		color: #fff;
		cursor: pointer;
	}

	.prev {
		left: 0;
	}

	.next {
		right: 0;
	}

	/* Hero: image sits under the (overlaid) nav at the top of the page. */
	.hero {
		position: relative;
		display: block;
		width: 100%;
		height: 90vh;
		padding: 0;
		border: none;
		background: #000;
		cursor: zoom-in;
		overflow: hidden;
	}

	.hero img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.hero-caption {
		position: absolute;
		left: 2rem;
		bottom: 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		color: #fff;
		text-align: left;
		text-shadow: 0 1px 4px rgb(0 0 0 / 0.6);
	}

	.hero-title {
		font-size: 1.6rem;
		font-style: italic;
	}

	.hero-sub {
		font-size: 0.9rem;
		max-width: 60ch;
	}
</style>
