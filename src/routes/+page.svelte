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

	/**
	 * Advance a scroll-snap strip one slide every few seconds, looping back to the start.
	 * Pauses while hovered/focused or the tab is hidden; off for reduced-motion users.
	 */
	function autoAdvance(node: HTMLElement, intervalMs = 5000) {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let paused = false;
		const pause = () => (paused = true);
		const resume = () => (paused = false);
		const events = [
			['pointerenter', pause],
			['pointerleave', resume],
			['focusin', pause],
			['focusout', resume]
		] as const;
		for (const [type, fn] of events) node.addEventListener(type, fn);
		const id = setInterval(() => {
			if (paused || document.hidden) return;
			const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 1;
			node.scrollTo({ left: atEnd ? 0 : node.scrollLeft + node.clientWidth, behavior: 'smooth' });
		}, intervalMs);
		return {
			destroy() {
				clearInterval(id);
				for (const [type, fn] of events) node.removeEventListener(type, fn);
			}
		};
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
		{:else if block.kind === 'single'}
			<ul class="block single">
				{@render artworkCard(
					block.artwork,
					'(max-width: 700px) 100vw, 640px',
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
	<ul class="strip" use:autoAdvance>
		{#each artworks as artwork, i (artwork.id)}
			{@render artworkCard(
				artwork,
				'(max-width: 1100px) 100vw, 1068px',
				true,
				aboveFold && i === 0,
				aboveFold && i === 0
			)}
		{/each}
	</ul>
{/snippet}

{#snippet immersive(artworks: Artwork[], aboveFold = false)}
	<div class="immersive">
		<ul class="track" use:autoAdvance>
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

	/* Single: one artwork, centred, not edge to edge. */
	.single {
		list-style: none;
		padding: 0;
		max-width: 640px;
		margin-left: auto;
		margin-right: auto;
	}

	.single .card img {
		width: auto;
		max-width: 100%;
		max-height: 80vh;
		margin-inline: auto;
	}

	/* Carousel: one artwork at a time within the content width; advances automatically. */
	.strip {
		display: flex;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		list-style: none;
		padding: 0;
	}

	.strip::-webkit-scrollbar {
		display: none;
	}

	.strip .card {
		flex: 0 0 100%;
		scroll-snap-align: start;
		text-align: center;
	}

	.strip .card img {
		width: auto;
		max-width: 100%;
		height: 70vh;
		object-fit: contain;
		margin-inline: auto;
	}

	.strip .caption {
		justify-content: center;
	}

	/* Immersive: full-bleed, one at a time; advances automatically. */
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
