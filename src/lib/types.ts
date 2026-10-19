// Types describing the Strapi v5 response for the `artwork` content type.

export interface StrapiImageFormat {
	ext: string;
	url: string;
	width: number;
	height: number;
	mime: string;
}

export interface StrapiMedia {
	id: number;
	documentId: string;
	name: string;
	alternativeText: string | null;
	caption: string | null;
	width: number | null;
	height: number | null;
	mime: string;
	url: string;
	formats: {
		xlarge?: StrapiImageFormat;
		large?: StrapiImageFormat;
		medium?: StrapiImageFormat;
		small?: StrapiImageFormat;
		thumbnail?: StrapiImageFormat;
	} | null;
}

export interface Dimension {
	id: number;
	width: number | null;
	height: number | null;
	depth: number | null;
	unit: 'cm' | null;
}

export interface Tag {
	id: number;
	documentId: string;
	name: string;
	slug: string;
}

export interface Artwork {
	id: number;
	documentId: string;
	title: string;
	description: string | null;
	location: string | null;
	date: string | null;
	medium: string | null;
	price: number | null;
	currency: string | null;
	quantity: number | null;
	sold: boolean;
	weightKg: number | null;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	coverImage: StrapiMedia | null;
	images: StrapiMedia[];
	dimensions: Dimension | null;
	tags: Tag[];
}

export type EventCategory = 'exhibition' | 'residency' | 'course';

export interface Event {
	id: number;
	documentId: string;
	title: string;
	category: EventCategory;
	venue: string | null;
	location: string | null;
	startDate: string | null;
	endDate: string | null;
	description: string | null;
}

export interface Award {
	id: number;
	documentId: string;
	title: string;
	organization: string | null;
	location: string | null;
	date: string | null;
	description: string | null;
}

export interface Bio {
	id: number;
	documentId: string;
	name: string | null;
	statement: string | null;
	portrait: StrapiMedia | null;
	email: string | null;
	availabilityNote: string | null;
	studioLocation: string | null;
}

/** A related artwork as returned inside a homepage block. Only `documentId` is relied on. */
export type ArtworkRef = { documentId: string } | null;

/** Homepage layout blocks exactly as Strapi returns them (`layout` dynamic zone). */
export type RawLayoutBlock =
	| {
			__component: 'layout.hero';
			id: number;
			artwork: ArtworkRef;
			title: string | null;
			subtitle: string | null;
	  }
	| { __component: 'layout.heading'; id: number; title: string; description: string | null }
	| { __component: 'layout.two-across'; id: number; left: ArtworkRef; right: ArtworkRef }
	| {
			__component: 'layout.three-across';
			id: number;
			left: ArtworkRef;
			middle: ArtworkRef;
			right: ArtworkRef;
	  }
	| {
			__component: 'layout.three-middle-large';
			id: number;
			left: ArtworkRef;
			middle: ArtworkRef;
			right: ArtworkRef;
	  }
	| { __component: 'layout.full-width'; id: number; artwork: ArtworkRef }
	| { __component: 'layout.immersive'; id: number; artworks: NonNullable<ArtworkRef>[] };

export interface Homepage {
	id: number;
	documentId: string;
	layout: RawLayoutBlock[];
}

/** One position in a row. `artwork` is null when the slot was left empty in Strapi. */
export interface RowSlot {
	artwork: Artwork | null;
	large: boolean;
}

/** Homepage blocks resolved against the full artwork data, ready to render. */
export type LayoutBlock =
	| { kind: 'hero'; key: string; artwork: Artwork; title: string; subtitle: string | null }
	| { kind: 'heading'; key: string; title: string; description: string | null }
	| { kind: 'row'; key: string; slots: RowSlot[] }
	| { kind: 'full-width'; key: string; artwork: Artwork }
	| { kind: 'immersive'; key: string; artworks: Artwork[] };

export interface StrapiCollectionResponse<T> {
	data: T[];
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

export interface StrapiSingleResponse<T> {
	data: T | null;
	meta: Record<string, never>;
}
