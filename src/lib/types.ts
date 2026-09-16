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
}

export interface Tag {
	id: number;
	documentId: string;
	name: string;
	slug: string;
}

export interface ArtworkGroup {
	id: number;
	documentId: string;
	title: string;
	description: string | null;
	sortOrder: number | null;
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
	sortOrder: number | null;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	coverImage: StrapiMedia | null;
	images: StrapiMedia[];
	dimensions: Dimension[];
	tags: Tag[];
	groups: ArtworkGroup[];
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
