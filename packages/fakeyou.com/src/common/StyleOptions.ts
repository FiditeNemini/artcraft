// Currently supported styles.
// These are the API names.
export type VstStyle
	= "anime_2_5d"
	| "anime_2d_flat"
	| "anime_ghibli"
	| "anime_retro_neon"
	| "anime_standard"
	| "cartoon_3d"
	| "comic_book"
	| "ink_bw_style"
	| "ink_punk"
	| "ink_splash"
	| "jojo_style"
	| "paper_origami"
	| "pixel_art"
	| "pop_art"
	| "realistic_1"
	| "realistic_2"
	;

// Definition of the different options.
export interface StyleOption {
    // Human-readable name
	label: string;

    // Optional animated webm preview (not all styles have previews yet)
	imageUrl?: string;

    // The API name of the style
    // NB: Named "value" so it's compatible with react-select
	value: VstStyle;
}

export const STYLE_OPTIONS: readonly StyleOption[] = [
	{
		label: "2D Anime",
		value: "anime_2_5d",
	},
	{
		label: "2D Anime (Flat)",
		imageUrl: "https://fakeyou.com/images/landing/onboarding/styles/style-2d-anime.webp",
		value: "anime_2d_flat",
	},
	{
		label: "Anime Ghibli",
		value: "anime_ghibli",
	},
	{
		label: "Anime Retro Neon",
		value: "anime_retro_neon",
	},
	{
		label: "Anime Standard",
		value: "anime_standard",
	},
	{
		label: "3D Cartoon",
		imageUrl: "https://fakeyou.com/images/landing/onboarding/styles/style-3d-cartoon.webp",
		value: "cartoon_3d",
	},
	{
		label: "Comic Book",
		value: "comic_book",
	},
	{
		label: "Ink B&W",
		imageUrl: "https://fakeyou.com/images/landing/onboarding/styles/style-ink-bw.webp",
		value: "ink_bw_style",
	},
	{
		label: "Ink Punk",
		value: "ink_punk",
	},
	{
		label: "Ink Splash",
		value: "ink_splash",
	},
	{
		label: "Jojo Style",
		value: "jojo_style",
	},
	{
		label: "Origami",
		imageUrl: "https://fakeyou.com/images/landing/onboarding/styles/style-origami.webp",
		value: "paper_origami",
	},
	// NB(bt,2024-04-02): Broken style for now
	//{
	//	label: "Pixel Art",
	//	value: "pixel_art",
	//},
	{
		label: "Pop Art",
		value: "pop_art",
	},
	{
		label: "Realistic 1",
		value: "realistic_1",
	},
	{
		label: "Realistic 2",
		value: "realistic_2",
	},
];

export const STYLES_BY_KEY : Map<string, StyleOption> = new Map(STYLE_OPTIONS.map((opt) => [opt.value, opt]));
