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

export interface Artwork {
	id: number;
	documentId: string;
	title: string;
	description: string | null;
	location: string | null;
	date: string | null;
	medium: string | null;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	coverImage: StrapiMedia | null;
	images: StrapiMedia[];
	dimensions: Dimension[];
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
