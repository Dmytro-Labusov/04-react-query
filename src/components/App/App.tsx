import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMovies } from "../../services/movieService";
import type { Movie, MovieResponse } from "../../types/movie";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import ReactPaginate from "react-paginate";
import css from "./App.module.css";

export default function App() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Movie | null>(null);

  const { data, isLoading, isError } = useQuery<MovieResponse, Error>({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: Boolean(query.trim()),
    staleTime: 5000,
  });

  const handleSearch = (q: string) => {
    if (!q.trim()) {
      toast.error(t("noQuery"));
      return;
    }
    setQuery(q);
    setPage(1);
    setSelected(null);
  };

  if (isError) {
    return (
      <div className={css.app}>
        <Toaster position="top-right" />
        <ErrorMessage />
      </div>
    );
  }

  return (
    <div className={css.app}>
      <Toaster position="top-right" />
      <LanguageSwitcher />
      <SearchBar onSubmit={handleSearch} />
      {isLoading && <Loader />}
      {data?.results && data.results.length > 0 && !isLoading && (
        <>
          <ReactPaginate
            pageCount={data.total_pages}
            pageRangeDisplayed={5}
            marginPagesDisplayed={1}
            onPageChange={({ selected }) => {
              setPage(selected + 1);
              setSelected(null);
            }}
            forcePage={page - 1}
            containerClassName={css.pagination}
            activeClassName={css.active}
            nextLabel="→"
            previousLabel="←"
          />
          <MovieGrid movies={data!.results} onSelect={setSelected} />
        </>
      )}
      {data?.results?.length === 0 && !isLoading && <p>{t("noMovies")}</p>}
      {selected && (
        <MovieModal movie={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
