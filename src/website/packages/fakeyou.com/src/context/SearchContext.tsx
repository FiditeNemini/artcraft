import React, { createContext, useContext, useState } from "react";

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  searchTerm: "",
  setSearchTerm: () => {},
});

export const useSearch = () => useContext(SearchContext);

export const SearchProvider: React.FC = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
};
