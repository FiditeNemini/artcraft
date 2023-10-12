import { useState, useMemo } from "react";

export default function useSearch(initialData: any[]) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    let tempData = [...initialData];

    if (searchTerm) {
      tempData = tempData.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTags.length) {
      tempData = tempData.filter((item) =>
        selectedTags.every((tag) => item.tags.includes(tag))
      );
    }

    return tempData;
  }, [searchTerm, selectedTags, initialData]);

  return {
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    filteredData,
  };
}
