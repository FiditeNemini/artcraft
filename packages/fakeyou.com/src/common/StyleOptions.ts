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

	| "hr_giger"
	| "simpsons"
	| "carnage"
	| "pastel_cute_anime"
	| "bloom_lighting"
	| "25d_horror"
	| "creepy"
	| "creepy_vhs"
	| "trail_cam_footage"
	| "old_black_white_movie"
	| "horror_noir_black_white"
	| "techno_noir_black_white"
	| "black_white_20s"
	| "cyberpunk_anime"
	| "dragonball"
	| "realistic_matrix"
	| "realistic_cyberpunk"
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
		label: "2.5D Anime",
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


	{
		label: "HR Giger",
		value: "hr_giger",
	},
	{
		label: "Simpsons",
		value: "simpsons",
	},
	{
		label: "Carnage",
		value: "carnage",
	},
	{
		label: "Anime Pastel Cute",
		value: "pastel_cute_anime",
	},
	{
		label: "iBloom Lighting",
		value: "bloom_lighting",
	},
	{
		label: "Horror 2.5D",
		value: "25d_horror",
	},
	{
		label: "Creepy",
		value: "creepy",
	},
	{
		label: "Creepy VHS",
		value: "creepy_vhs",
	},
	{
		label: "Trail Cam Footage",
		value: "trail_cam_footage",
	},
	{
		label: "Old Black and White Movie",
		value: "old_black_white_movie",
	},
	{
		label: "Horror Noir Black and White",
		value: "horror_noir_black_white",
	},
	{
		label: "Techno Noir Black and White",
		value: "techno_noir_black_white",
	},
	{
		label: "Black White 20s",
		value: "black_white_20s",
	},
	{
		label: "Cyberpunk Anime",
		value: "cyberpunk_anime",
	},
	{
		label: "Dragonball",
		value: "dragonball",
	},
	{
		label: "Realistic Matrix",
		value: "realistic_matrix",
	},
	{
		label: "Realistic Cyberpunk",
		value: "realistic_cyberpunk",
	},




];

export const STYLES_BY_KEY : Map<string, StyleOption> = new Map(STYLE_OPTIONS.map((opt) => [opt.value, opt]));
