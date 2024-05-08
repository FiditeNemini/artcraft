import React from "react";

interface Props {
	onClick: (e: React.MouseEvent) => null;
	value: string;
}

export enum Filters {
	Featured,
	Mine,
	Bookmarked,
}

export default function FilterButtons({ onClick, value }: Props) {
	return Object.keys(Filters)
		.filter((filterKey) => isNaN(Number(filterKey)))
		.map((filterKey, key) => {
			const isBookmarks = key === Filters.Bookmarked;
			return (
				<button
					key={key}
					{...{
						className: `filter-tab${value === key ? " active" : ""}`,
						...(isBookmarks ? { disabled: true } : {}),
						onClick,
						value: key,
					}}>
					{filterKey}
				</button>
			);
		});
}
