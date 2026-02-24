import { useEffect, useMemo, useState } from "react";
import { photos } from "./data/photos";
import { photoLocations } from "./data/photoLocations";

const FILTERS: Array<{ label: string; value: string }> = [
  { label: "All", value: "All" },
  { label: "Film", value: "Film Camera" },
  { label: "Digital", value: "Woah" },
];

const encodeSrc = (src: string) => encodeURI(src);

export default function App() {
  const [filter, setFilter] = useState("All");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isLoading, setIsLoading] = useState(true);

  const filtered = useMemo(() => {
    if (filter === "All") return photos;
    return photos.filter((photo) => photo.set === filter);
  }, [filter]);

  const activeIndex = useMemo(() => {
    if (activeId === null) return -1;
    return filtered.findIndex((photo) => photo.id === activeId);
  }, [activeId, filtered]);

  const activePhoto = activeIndex >= 0 ? filtered[activeIndex] : null;

  const closeLightbox = () => setActiveId(null);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    let isMounted = true;
    const loaders = photos.map(
      (photo) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = encodeSrc(photo.src);
        })
    );

    Promise.all(loaders).then(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeId === null) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [activeId]);

  return (
    <div className="page" aria-busy={isLoading}>
      {isLoading && (
        <div className="loader" role="status" aria-live="polite">
          <span className="loader-ring" aria-hidden="true" />
          <span className="loader-text">Loading gallery</span>
        </div>
      )}
      <button
        type="button"
        className="theme-icon"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path d="M6.8 4.2a.9.9 0 1 1-1.3 1.3L4.2 4.2a.9.9 0 0 1 1.3-1.3l1.3 1.3Zm12.9 0 1.3-1.3a.9.9 0 1 0-1.3-1.3l-1.3 1.3a.9.9 0 1 0 1.3 1.3ZM12 4.2a.9.9 0 0 0 .9-.9V1.4a.9.9 0 0 0-1.8 0v1.9a.9.9 0 0 0 .9.9Zm0 2.7a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2Zm9.6 4.2h-1.9a.9.9 0 0 0 0 1.8h1.9a.9.9 0 0 0 0-1.8Zm-17.4.9a.9.9 0 0 0-.9-.9H1.4a.9.9 0 0 0 0 1.8h1.9a.9.9 0 0 0 .9-.9Zm2.6 6.2-1.3 1.3a.9.9 0 1 0 1.3 1.3l1.3-1.3a.9.9 0 1 0-1.3-1.3Zm12.9 0a.9.9 0 1 0-1.3 1.3l1.3 1.3a.9.9 0 1 0 1.3-1.3l-1.3-1.3ZM12 19.8a.9.9 0 0 0-.9.9v1.9a.9.9 0 1 0 1.8 0v-1.9a.9.9 0 0 0-.9-.9Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
          </svg>
        )}
      </button>
      <header className="topbar">
        <div>
          <p className="eyebrow">Gallery</p>
          <h1>Quiet Frames</h1>
          <p className="subtitle">A calm set of everyday scenes, pared down.</p>
        </div>
        <div className="filters filters-header" role="tablist" aria-label="Collection">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={filter === option.value ? "filter active" : "filter"}
              onClick={() => setFilter(option.value)}
              role="tab"
              aria-selected={filter === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div className="filters filters-tabs" role="tablist" aria-label="Collection tabs">
        {FILTERS.map((option) => (
          <button
            key={`${option.value}-tab`}
            type="button"
            className={filter === option.value ? "filter active" : "filter"}
            onClick={() => setFilter(option.value)}
            role="tab"
            aria-selected={filter === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      <main className="gallery" aria-live="polite">
        {filtered.map((photo) => (
          <button
            key={photo.id}
            type="button"
            className="tile"
            onClick={() => setActiveId(photo.id)}
            aria-label={`Open ${photo.name}`}
          >
            <img
              src={encodeSrc(photo.src)}
              alt={photo.name}
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </main>

      {activePhoto && (
        <div className="lightbox" role="dialog" aria-modal="true">
          <button
            type="button"
            className="lightbox-backdrop"
            onClick={closeLightbox}
            aria-label="Close"
          />
          <div className="lightbox-content">
            <img src={encodeSrc(activePhoto.src)} alt={activePhoto.name} />
            <p className="lightbox-location">
              <span className="pin" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M12 2.5a7 7 0 0 1 7 7c0 4.3-4.6 9.7-6.1 11.4a1.2 1.2 0 0 1-1.8 0C9.6 19.2 5 13.8 5 9.5a7 7 0 0 1 7-7Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                </svg>
              </span>
              : {photoLocations[String(activePhoto.id)] || "Add location"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
