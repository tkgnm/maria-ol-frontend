<script lang="ts">
	import { resolve } from '$app/paths';
	import { largeMediaUrl, mediaSize, mediaSrcset, thumbMediaUrl } from '$lib/media';
	import type { Artwork, StrapiMedia } from '$lib/types';

	let {
		artwork,
		email,
		onclose
	}: { artwork: Artwork | null; email: string | null; onclose: () => void } = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	let activeIndex = $state(0);

	const images = $derived.by<StrapiMedia[]>(() => {
		if (!artwork) return [];
		const all = [artwork.coverImage, ...artwork.images].filter(
			(m): m is StrapiMedia => m != null && m.mime.startsWith('image/')
		);
		return all.filter((m, i) => all.findIndex((o) => o.id === m.id) === i);
	});
	const current = $derived(images[activeIndex] ?? null);
	const contactHref = $derived(
		artwork && email
			? `mailto:${email}?subject=${encodeURIComponent(`Enquiry: ${artwork.title}`)}`
			: null
	);

	$effect(() => {
		if (!dialog) return;
		if (artwork && !dialog.open) {
			activeIndex = 0;
			dialog.showModal();
		} else if (!artwork && dialog.open) {
			dialog.close();
		}
	});

	function onkeydown(e: KeyboardEvent) {
		if (images.length < 2) return;
		if (e.key === 'ArrowRight') activeIndex = (activeIndex + 1) % images.length;
		if (e.key === 'ArrowLeft') activeIndex = (activeIndex - 1 + images.length) % images.length;
	}

	function onbackdrop(e: MouseEvent) {
		if (e.target === dialog) onclose();
	}
</script>

<dialog bind:this={dialog} {onclose} {onkeydown} onclick={onbackdrop} aria-label={artwork?.title}>
	{#if artwork}
		<button class="close" type="button" aria-label="Close" onclick={onclose}>×</button>
		<div class="body">
			<div class="media">
				{#if current}
					<img
						src={largeMediaUrl(current)}
						srcset={mediaSrcset(current)}
						{...mediaSize(current)}
						sizes="(max-width: 900px) 100vw, 60vw"
						alt={current.alternativeText ?? artwork.title}
					/>
				{/if}
				{#if images.length > 1}
					<ul class="thumbs">
						{#each images as img, i (img.id)}
							<li>
								<button
									type="button"
									class:active={i === activeIndex}
									aria-label="Show image {i + 1}"
									onclick={() => (activeIndex = i)}
								>
									<img src={thumbMediaUrl(img)} alt="" loading="lazy" />
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			<div class="details">
				<h2>
					{artwork.title}
					{#if artwork.sold}<span class="badge">Sold</span>{/if}
				</h2>
				{#if artwork.medium}<p class="muted">{artwork.medium}</p>{/if}
				{#if artwork.date}<p class="muted">{artwork.date}</p>{/if}
				{#if artwork.location}<p class="muted">{artwork.location}</p>{/if}
				{#if artwork.dimensions.length}
					<ul class="plain muted">
						{#each artwork.dimensions as dim (dim.id)}
							<li>
								{dim.width ?? '?'} × {dim.height ?? '?'}{dim.depth ? ` × ${dim.depth}` : ''} cm
							</li>
						{/each}
					</ul>
				{/if}
				{#if artwork.description}<p class="description">{artwork.description}</p>{/if}
				{#if artwork.price != null && !artwork.sold}
					<p class="price">{artwork.price} {artwork.currency ?? 'EUR'}</p>
				{/if}
				{#if artwork.tags.length}
					<ul class="plain tags">
						{#each artwork.tags as tag (tag.documentId)}
							<li>{tag.name}</li>
						{/each}
					</ul>
				{/if}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- mailto link -->
				<a class="contact" href={contactHref ?? resolve('/contact')}>
					{artwork.sold ? 'Ask about similar works' : 'Contact about this work'}
				</a>
			</div>
		</div>
	{/if}
</dialog>

<style>
	dialog {
		width: min(1100px, 94vw);
		max-height: 92vh;
		padding: 0;
		border: none;
		background: Canvas;
		color: CanvasText;
		overflow: auto;
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 0.75);
	}

	.close {
		position: absolute;
		top: 0.5rem;
		right: 0.75rem;
		z-index: 1;
		font-size: 2rem;
		line-height: 1;
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
	}

	.body {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
		gap: 2rem;
		padding: 2rem;
	}

	@media (max-width: 760px) {
		.body {
			grid-template-columns: 1fr;
			padding: 1rem;
		}
	}

	.media > img {
		width: 100%;
		max-height: 70vh;
		object-fit: contain;
		display: block;
	}

	.thumbs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		list-style: none;
		margin: 0.75rem 0 0;
		padding: 0;
	}

	.thumbs button {
		padding: 0;
		border: 2px solid transparent;
		background: none;
		cursor: pointer;
		opacity: 0.6;
	}

	.thumbs button.active {
		border-color: currentColor;
		opacity: 1;
	}

	.thumbs img {
		width: 64px;
		height: 64px;
		object-fit: cover;
		display: block;
	}

	h2 {
		font-weight: 400;
		font-style: italic;
		font-size: 1.3rem;
		margin: 0 0 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.badge {
		font-size: 0.7rem;
		font-style: normal;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.6;
		border: 1px solid currentColor;
		padding: 0.1rem 0.4rem;
	}

	.details p {
		margin: 0 0 0.25rem;
		font-size: 0.9rem;
	}

	.muted {
		opacity: 0.7;
	}

	.description {
		margin-top: 1rem !important;
	}

	.price {
		margin-top: 1rem !important;
		font-weight: 500;
	}

	.plain {
		list-style: none;
		margin: 0.5rem 0 0;
		padding: 0;
		font-size: 0.85rem;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 1rem;
	}

	.tags li {
		font-size: 0.75rem;
		opacity: 0.7;
		border: 1px solid currentColor;
		padding: 0.1rem 0.4rem;
	}

	.contact {
		display: inline-block;
		margin-top: 1.5rem;
		padding: 0.6rem 1.2rem;
		border: 1px solid currentColor;
		color: inherit;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.contact:hover {
		background: CanvasText;
		color: Canvas;
	}
</style>
