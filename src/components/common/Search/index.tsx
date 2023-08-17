"use client"; // This is a client component 👈🏽

import { HiSearch } from "react-icons/hi";

interface SearchProps {
  value: string;
  //   setValue: (value: string) => void;
}

const Search: React.FC<SearchProps> = ({
  value,
  //   setValue,
}) => {
  return (
    <form className="flex items-center">
      <label htmlFor="simple-search" className="sr-only">
        Search
      </label>
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <HiSearch />
        </div>
        <input
          type="text"
          id="simple-search"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search"
          required
        />
      </div>
    </form>
  );
};

export default Search;
