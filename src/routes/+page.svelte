<script lang="ts">
	import Lightbox from '$lib/components/Lightbox.svelte';
	import { largeMediaUrl, mediaSize, mediaSrcset, mediaUrl } from '$lib/media';
	import type { Artwork, RowSlot } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let lightboxArtwork = $state<Artwork | null>(null);

	/** Max width of the content column, minus side padding, in px. */
	const CONTENT_WIDTH = 1068;
	const ROW_GAP = 32;

	/** CSS grid columns for a row: the large slot gets twice the width. */
	function columns(slots: RowSlot[]): string {
		return slots.map((s) => (s.large ? '2fr' : '1fr')).join(' ');
	}

	/** `sizes` attribute for one slot, so the browser picks the right image from the srcset. */
	function slotSizes(slots: RowSlot[], slot: RowSlot): string {
		const total = slots.reduce((n, s) => n + (s.large ? 2 : 1), 0);
		const usable = CONTENT_WIDTH - ROW_GAP * (slots.length - 1);
		const px = Math.round((usable * (slot.large ? 2 : 1)) / total);
		return `(max-width: 560px) 100vw, ${px}px`;
	}

	function scrollCarousel(e: MouseEvent, direction: 1 | -1) {
		const track = (e.currentTarget as HTMLElement).parentElement?.querySelector('.track, .strip');
		track?.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Maria OL — Artworks</title>
</svelte:head>

<main>
	<h1>Artworks</h1>

	{#if data.blocks.length === 0}
		<p>No artworks found.</p>
	{/if}

	{#each data.blocks as block, i (block.key)}
		{@const aboveFold = i === 0}
		{#if block.kind === 'hero'}
			<button class="block hero" type="button" onclick={() => (lightboxArtwork = block.artwork)}>
				<img
					src={largeMediaUrl(block.artwork.coverImage)}
					srcset={mediaSrcset(block.artwork.coverImage)}
					{...mediaSize(block.artwork.coverImage)}
					sizes="100vw"
					loading={aboveFold ? 'eager' : 'lazy'}
					fetchpriority={aboveFold ? 'high' : undefined}
					decoding="async"
					alt={block.artwork.coverImage?.alternativeText ?? block.artwork.title}
				/>
				<span class="hero-caption">
					<span class="hero-title">{block.title}</span>
					{#if block.subtitle}<span class="hero-sub">{block.subtitle}</span>{/if}
				</span>
			</button>
		{:else if block.kind === 'heading'}
			<header class="block heading">
				<h2>{block.title}</h2>
				{#if block.description}<p class="heading-description">{block.description}</p>{/if}
			</header>
		{:else if block.kind === 'row'}
			<ul class="block row" style:grid-template-columns={columns(block.slots)}>
				{#each block.slots as slot, j (j)}
					{#if slot.artwork}
						{@render artworkCard(
							slot.artwork,
							slotSizes(block.slots, slot),
							slot.large,
							aboveFold,
							aboveFold && (slot.large || j === 0)
						)}
					{:else}
						<li aria-hidden="true"></li>
					{/if}
				{/each}
			</ul>
		{:else if block.kind === 'full-width'}
			<ul class="block row">
				{@render artworkCard(
					block.artwork,
					`(max-width: 1100px) 100vw, ${CONTENT_WIDTH}px`,
					true,
					aboveFold,
					aboveFold
				)}
			</ul>
		{:else if block.kind === 'carousel'}
			<div class="block">
				{@render carousel(block.artworks, aboveFold)}
			</div>
		{:else if block.kind === 'immersive'}
			<div class="block">
				{@render immersive(block.artworks, aboveFold)}
			</div>
		{/if}
	{/each}
</main>

{#snippet artworkCard(
	artwork: Artwork,
	sizes: string,
	wide: boolean,
	eager: boolean,
	priority: boolean
)}
	{@const cover = mediaUrl(artwork.coverImage)}
	<li class="card">
		<button type="button" class="open" onclick={() => (lightboxArtwork = artwork)}>
			{#if cover}
				<img
					src={wide ? largeMediaUrl(artwork.coverImage) : cover}
					srcset={mediaSrcset(artwork.coverImage)}
					{...mediaSize(artwork.coverImage)}
					{sizes}
					loading={eager ? 'eager' : 'lazy'}
					fetchpriority={priority ? 'high' : undefined}
					decoding="async"
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

{#snippet carousel(artworks: Artwork[], aboveFold = false)}
	<div class="carousel">
		<ul class="strip">
			{#each artworks as artwork, i (artwork.id)}
				{@render artworkCard(
					artwork,
					'(max-width: 560px) 80vw, 480px',
					true,
					aboveFold && i < 3,
					aboveFold && i === 0
				)}
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

{#snippet immersive(artworks: Artwork[], aboveFold = false)}
	<div class="immersive">
		<ul class="track">
			{#each artworks as artwork, i (artwork.id)}
				<li>
					<button type="button" class="open" onclick={() => (lightboxArtwork = artwork)}>
						<img
							src={largeMediaUrl(artwork.coverImage)}
							srcset={mediaSrcset(artwork.coverImage)}
							{...mediaSize(artwork.coverImage)}
							sizes="100vw"
							loading={aboveFold && i === 0 ? 'eager' : 'lazy'}
							fetchpriority={aboveFold && i === 0 ? 'high' : undefined}
							decoding="async"
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

	.block {
		margin: 0 0 3rem;
	}

	.heading {
		margin-bottom: 1.5rem;
	}

	.heading h2 {
		font-weight: 400;
		font-style: italic;
		font-size: 1.2rem;
		margin: 0 0 0.25rem;
	}

	.heading-description {
		opacity: 0.7;
		font-size: 0.9rem;
		margin: 0;
		max-width: 60ch;
	}

	.row {
		display: grid;
		gap: 2rem;
		align-items: center;
		list-style: none;
		padding: 0;
	}

	@media (max-width: 560px) {
		/* Rows stack on phones; overrides the inline column template. */
		.row {
			grid-template-columns: 1fr !important;
		}
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

	/* Carousel: within the content width, several artworks visible, same height, scrolls sideways. */
	.carousel {
		position: relative;
	}

	.strip {
		display: flex;
		gap: 2rem;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.strip .card {
		flex: none;
		scroll-snap-align: start;
	}

	.strip .card img {
		height: 360px;
		width: auto;
		max-width: none;
	}

	@media (max-width: 560px) {
		.strip .card img {
			height: 260px;
		}
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

	/* Hero: full-bleed image with a caption over it. */
	.hero {
		position: relative;
		display: block;
		width: 100vw;
		margin-left: calc(50% - 50vw);
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
