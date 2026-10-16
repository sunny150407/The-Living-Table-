"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateRecipes, OPTIONS, Recipe } from "@/lib/data";
import { photoSlug, DishPhoto } from "@/lib/images";
import MANIFEST from "@/lib/photo-manifest.json";
import Voronoi from "./voronoi";

const GROUPS: { name: string; facets: { key: keyof Recipe; label: string; opts: readonly string[] }[] }[] = [
  {
    name: "Primary & Structural",
    facets: [
      { key: "ingredient", label: "Primary ingredient", opts: OPTIONS.ingredient },
      { key: "dietary", label: "Dietary & nutritional", opts: OPTIONS.dietary },
      { key: "course", label: "Course & occasion", opts: OPTIONS.course },
      { key: "region", label: "Cuisine & region", opts: OPTIONS.region },
      { key: "method", label: "Cooking method", opts: OPTIONS.method },
    ],
  },
  {
    name: "Contextual & Historical",
    facets: [
      { key: "era", label: "Era", opts: OPTIONS.era },
      { key: "source", label: "Source format", opts: OPTIONS.source },
      { key: "contributor", label: "Contributor", opts: OPTIONS.contributor },
      { key: "context", label: "Cultural context", opts: OPTIONS.context },
    ],
  },
  {
    name: "Operational & Utility",
    facets: [
      { key: "time", label: "Prep & cooking time", opts: OPTIONS.time },
      { key: "difficulty", label: "Difficulty", opts: OPTIONS.difficulty },
      { key: "yield", label: "Yield", opts: OPTIONS.yield },
      { key: "season", label: "Seasonality", opts: OPTIONS.season },
    ],
  },
];

function Photo({ r, w, h, credit }: { r: Recipe; w: number; h: number; credit?: boolean }) {
  const slug = photoSlug(r.title);
  const p = (MANIFEST as Record<string, DishPhoto | null>)[slug] || null;
  const [useFallback, setUseFallback] = useState(false);
  const [bad, setBad] = useState(false);

  useEffect(() => {
    setUseFallback(false);
    setBad(false);
  }, [r.title]);

  if (!p || bad) {
    const initials = r.title
      .split(/[\s(]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");
    return (
      <div className="ph" role="img" aria-label={`Archival plate illustration for ${r.title}`}>
        <div className="ph__inner">
          <span className="ph__monogram">{initials || "LT"}</span>
          <span className="ph__region">{r.region}</span>
          <span className="ph__sub">
            {r.ingredient} · {r.method}
          </span>
        </div>
      </div>
    );
  }

  const primaryUrl = credit ? p.full : p.src;
  const activeUrl = useFallback && p.fallback ? p.fallback : primaryUrl;

  return (
    <div className="photoWrap">
      <img
        src={activeUrl}
        alt={r.alt || r.title}
        loading="lazy"
        referrerPolicy="no-referrer"
        width={w}
        height={h}
        onError={() => {
          if (!useFallback && p.fallback && p.fallback !== primaryUrl) {
            setUseFallback(true);
          } else {
            setBad(true);
          }
        }}
      />
      {credit && p.creditUrl && (
        <p className="photoCredit">
          <a href={p.creditUrl} target="_blank" rel="noreferrer">
            Photograph · {p.credit} ↗
          </a>
        </p>
      )}
      {credit && !p.creditUrl && <p className="photoCredit">Photograph · {p.credit}</p>}
    </div>
  );
}

const vals = (r: Recipe, k: keyof Recipe) => ([] as string[]).concat(r[k] as string | string[]);

// Indian food-label mark: green for vegetarian/vegan, red for everything else (meat, fish, egg)
function VegMark({ r }: { r: Recipe }) {
  const veg = r.dietary.some((d) => d === "Vegetarian" || d === "Vegan");
  return (
    <span
      className={`vegMark ${veg ? "" : "vegMark--nonveg"}`}
      role="img"
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      title={veg ? "Vegetarian" : "Non-vegetarian"}
    />
  );
}

export default function Home() {
  const all = useMemo(() => generateRecipes(500), []);
  const hay = useMemo(
    () =>
      all.map((r) =>
        [
          r.title,
          r.description,
          r.story,
          r.contributor,
          r.region,
          r.era,
          r.source,
          r.ingredient,
          r.course,
          r.method,
          ...r.ingredients,
          ...r.tags,
        ]
          .join(" ")
          .toLowerCase()
      ),
    [all]
  );

  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Record<string, string[]>>({});
  const [limit, setLimit] = useState(24);
  const [open, setOpen] = useState<Recipe | null>(null);
  const [panel, setPanel] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [scrollPct, setScrollPct] = useState(0);
  const [checkedIng, setCheckedIng] = useState<Record<string, boolean>>({});

  // Region counts for the Table of Contents
  const regionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of all) {
      counts[r.region] = (counts[r.region] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [all]);

  // Scroll progress bar & Escape key handler for modal
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCheckedIng({});
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    if (overlayRef.current) {
      overlayRef.current.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return all.filter(
      (r, i) =>
        terms.every((t) => hay[i].includes(t)) &&
        Object.entries(sel).every(([k, v]) => !v.length || v.some((x) => vals(r, k as keyof Recipe).includes(x)))
    );
  }, [all, hay, q, sel]);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setLimit((l) => l + 24);
      },
      { rootMargin: "800px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [limit, results.length]);

  const toggle = (k: string, v: string) => {
    setLimit(24);
    setSel((s) => {
      const c = s[k] || [];
      return { ...s, [k]: c.includes(v) ? c.filter((x) => x !== v) : [...c, v] };
    });
  };

  const selectSingleRegion = (regionName: string | null) => {
    setLimit(24);
    setSel((s) => {
      if (!regionName) {
        const next = { ...s };
        delete next.region;
        return next;
      }
      const current = s.region || [];
      if (current.length === 1 && current[0] === regionName) {
        const next = { ...s };
        delete next.region;
        return next;
      }
      return { ...s, region: [regionName] };
    });
  };

  // 3D Card Tilt handlers
  const handleCardMove = (e: React.MouseEvent<HTMLLIElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * 9;
    const ry = (px - 0.5) * 11;
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLLIElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const chips = Object.entries(sel).flatMap(([k, v]) => v.map((x) => [k, x] as const));
  const activeRegions = sel.region || [];

  const openIdx = open ? results.findIndex((r) => r.id === open.id) : -1;
  const prevRecipe = openIdx > 0 ? results[openIdx - 1] : null;
  const nextRecipe = openIdx >= 0 && openIdx < results.length - 1 ? results[openIdx + 1] : null;

  const filters = (
    <div className="filterGroups">
      {GROUPS.map((g) => (
        <fieldset key={g.name} className="group">
          <legend>{g.name}</legend>
          {g.facets.map((f) => (
            <details key={f.key} open={f.key === "region" || f.key === "course" || !!sel[f.key]?.length}>
              <summary>
                <span>{f.label}</span>
                {sel[f.key]?.length ? <span className="facetCount">{sel[f.key].length}</span> : null}
              </summary>
              <div className="optList">
                {f.opts.map((o) => (
                  <label key={o} className={`opt ${sel[f.key]?.includes(o) ? "opt--active" : ""}`}>
                    <input
                      type="checkbox"
                      checked={!!sel[f.key]?.includes(o)}
                      onChange={() => toggle(f.key, o)}
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </details>
          ))}
        </fieldset>
      ))}
    </div>
  );

  return (
    <>
      <header className="topbar">
        <a href="#cover" className="topbar__brand">
          The Living <em>Table</em>
        </a>
        <div className="topbar__meta">
          <span className="topbar__chapter">Issue No. 01 · {all.length} Archival Plates</span>
          <nav className="topbar__nav" aria-label="Main">
            <a href="#regions">Contents</a>
            <a href="#archive">Archive</a>
          </nav>
        </div>
        <div
          className="topbar__progress"
          style={{ transform: `scaleX(${scrollPct})` }}
          aria-hidden="true"
        />
      </header>

      <main>
        {/* MAGAZINE COVER HERO */}
        <section id="cover" className="hero" aria-labelledby="h1">
          <div className="hero__grid">
            <div className="hero__content">
              <div className="hero__headerRow">
                <div className="monogram" aria-hidden="true">
                  <span>T</span>
                </div>
                <div className="hero__kickerWrap">
                  <p className="kicker">Indian Culinary Archive · Issue No. 01</p>
                  <p className="kickerSub">Curated Oral Histories, Domestic Hearths &amp; Regional Traditions</p>
                </div>
              </div>

              <h1 id="h1" className="hero__title">
                The Living <em>Table</em>
              </h1>

              <p className="lead">
                Recipes carry more than instructions. Across {regionStats.length} distinct Indian regional and
                cultural kitchens, they preserve voices, migrations, sacred rituals, and the intimate memory of home.
              </p>

              <form className="searchForm" role="search" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="s" className="sr">
                  Search the archive
                </label>
                <div className="searchBox">
                  <span className="searchIcon" aria-hidden="true">
                    ⌕
                  </span>
                  <input
                    id="s"
                    type="search"
                    className="search"
                    value={q}
                    placeholder="Search 500 dishes, regions, ingredients, rituals, or memories..."
                    onChange={(e) => {
                      setQ(e.target.value);
                      setLimit(24);
                    }}
                  />
                  {q && (
                    <button
                      type="button"
                      className="searchClear"
                      onClick={() => setQ("")}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </form>

              <div className="hero__stats" role="note">
                <div className="statPill">
                  <strong>{all.length}</strong>
                  <span>Authentic Recipes</span>
                </div>
                <div className="statPill">
                  <strong>{regionStats.length}</strong>
                  <span>Regional Traditions</span>
                </div>
                <div className="statPill">
                  <strong>13</strong>
                  <span>Archival Facets</span>
                </div>
              </div>
            </div>

            <div className="hero__visual">
              <Voronoi />
            </div>
          </div>
        </section>

        {/* EDITORIAL TABLE OF CONTENTS BY REGION */}
        <section id="regions" className="tocSection" aria-label="Table of Contents by Regional Tradition">
          <div className="tocSection__head">
            <div>
              <p className="kicker">Table of Contents · Regional Index</p>
              <h2 className="sectionTitle">Chapters by Regional &amp; Cultural Kitchen</h2>
            </div>
            <div className="tocSection__actions">
              {activeRegions.length > 0 && (
                <button className="btn btn--ghost" onClick={() => selectSingleRegion(null)}>
                  Show All Regions ({all.length}) ✕
                </button>
              )}
            </div>
          </div>

          <div className="tocGrid" role="list">
            <button
              role="listitem"
              className={`tocItem tocItem--all ${activeRegions.length === 0 ? "tocItem--active" : ""}`}
              onClick={() => selectSingleRegion(null)}
            >
              <span className="tocItem__num">00</span>
              <span className="tocItem__name">Complete All-India Archive</span>
              <span className="tocItem__dots" aria-hidden="true" />
              <span className="tocItem__count">{all.length} Recipes</span>
            </button>

            {regionStats.map(([reg, count], index) => {
              const isSelected = activeRegions.includes(reg);
              return (
                <button
                  key={reg}
                  role="listitem"
                  className={`tocItem ${isSelected ? "tocItem--active" : ""}`}
                  onClick={() => selectSingleRegion(reg)}
                >
                  <span className="tocItem__num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="tocItem__name">{reg}</span>
                  <span className="tocItem__dots" aria-hidden="true" />
                  <span className="tocItem__count">
                    {count} {count === 1 ? "Recipe" : "Recipes"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* MAIN ARCHIVE LAYOUT */}
        <section id="archive" className="layout" aria-label="Archive">
          <aside className={`filters ${panel ? "show" : ""}`} aria-label="Filters">
            <div className="filters__head">
              <div>
                <p className="kicker">Index &amp; Taxonomy</p>
                <h2>Archival Filters</h2>
              </div>
              {chips.length > 0 && (
                <button className="btn btn--small" onClick={() => setSel({})}>
                  Reset
                </button>
              )}
            </div>
            {filters}
            <button className="btn btn--gold mobileOnly" onClick={() => setPanel(false)}>
              View {results.length.toLocaleString()} plates
            </button>
          </aside>

          <div className="archiveMain">
            <div className="bar">
              <div className="bar__left">
                <button className="btn mobileOnly" onClick={() => setPanel(true)}>
                  Filters{chips.length ? ` (${chips.length})` : ""}
                </button>
                <p className="recordCount" aria-live="polite">
                  Showing <strong>{results.length.toLocaleString()}</strong> of {all.length} archival records
                </p>
              </div>
              <div className="bar__right">
                <div className="viewToggle" role="group" aria-label="Layout view">
                  <button
                    className={`viewBtn ${view === "grid" ? "viewBtn--active" : ""}`}
                    onClick={() => setView("grid")}
                  >
                    Grid
                  </button>
                  <button
                    className={`viewBtn ${view === "list" ? "viewBtn--active" : ""}`}
                    onClick={() => setView("list")}
                  >
                    Editorial List
                  </button>
                </div>
              </div>
            </div>

            {chips.length > 0 && (
              <div className="chips" aria-label="Active filters">
                {chips.map(([k, v]) => (
                  <button
                    key={k + v}
                    className="chip"
                    onClick={() => toggle(k, v)}
                    aria-label={`Remove filter ${v}`}
                  >
                    <span>{v}</span>
                    <span className="chip__x">✕</span>
                  </button>
                ))}
                <button className="btn btn--small" onClick={() => setSel({})}>
                  Clear all filters
                </button>
              </div>
            )}

            <ul className={`cards ${view}`}>
              {results.slice(0, limit).map((r, idx) => (
                <li
                  key={r.id}
                  className="card"
                  data-course={r.course}
                  onMouseMove={handleCardMove}
                  onMouseLeave={handleCardLeave}
                  onClick={() => setOpen(r)}
                >
                  <div className="card__glare" aria-hidden="true" />
                  <div className="card__media">
                    <Photo r={r} w={480} h={320} />
                    <div className="card__badges">
                      <VegMark r={r} />
                      <span className="badge badge--region">{r.region}</span>
                      <span className="badge badge--course">{r.course}</span>
                    </div>
                    <span className="card__num">No. {String(idx + 1).padStart(3, "0")}</span>
                  </div>
                  <div className="cb">
                    <p className="cb__kicker">
                      {r.era} · {r.context}
                    </p>
                    <h3>
                      <button
                        className="link"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(r);
                        }}
                      >
                        {r.title}
                      </button>
                    </h3>
                    <p className="cb__excerpt">{r.story}</p>
                    <div className="cb__footer">
                      <p className="meta">
                        {r.contributor} · {r.time}
                      </p>
                      <span className="cb__read">Read Plate →</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {results.length === 0 && (
              <div className="emptyState">
                <p className="kicker">No Archival Matches</p>
                <h3>No recipes match your current filter combination.</h3>
                <p>Try clearing a filter chip or searching for a broader ingredient or region.</p>
                <button
                  className="btn btn--gold"
                  onClick={() => {
                    setQ("");
                    setSel({});
                  }}
                >
                  Reset Search &amp; Filters
                </button>
              </div>
            )}

            {limit < results.length && (
              <div ref={sentinel} className="sentinel" role="status">
                Unfolding more archival plates…
              </div>
            )}
          </div>
        </section>
      </main>

      {/* MAGAZINE SPREAD MODAL */}
      {open && (
        <div
          ref={overlayRef}
          className="overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mt"
          onClick={() => setOpen(null)}
        >
          <article className="modal" data-course={open.course} onClick={(e) => e.stopPropagation()}>
            <div className="modal__topbar">
              <button className="btn btn--ghost" autoFocus onClick={() => setOpen(null)}>
                ← Back to Archive
              </button>
              <div className="modal__nav">
                {prevRecipe && (
                  <button className="btn btn--small" onClick={() => setOpen(prevRecipe)}>
                    ← {prevRecipe.title}
                  </button>
                )}
                {nextRecipe && (
                  <button className="btn btn--small" onClick={() => setOpen(nextRecipe)}>
                    {nextRecipe.title} →
                  </button>
                )}
              </div>
            </div>

            <div className="modal__hero">
              <div className="modal__titleCol">
                <p className="kicker modal__kicker">
                  <VegMark r={open} />
                  <span>
                    {open.region} Tradition · {open.course} · {open.era}
                  </span>
                </p>
                <h2 id="mt" className="modal__title">
                  {open.title}
                </h2>
                <p className="modal__byline">
                  Preserved via <strong>{open.contributor}</strong> ({open.source}) · {open.context}
                </p>
                <blockquote className="modal__story">
                  <p>{open.story}</p>
                </blockquote>
              </div>
              <div className="modal__photoCol">
                <Photo key={open.id} r={open} w={900} h={600} credit />
              </div>
            </div>

            <dl className="dl">
              {(
                [
                  ["Primary Ingredient", open.ingredient],
                  ["Dietary Profile", open.dietary.join(", ")],
                  ["Course", open.course],
                  ["Technique", open.method],
                  ["Total Time", open.time],
                  ["Difficulty", open.difficulty],
                  ["Yield", open.yield],
                  ["Seasonality", open.season],
                  ["Cultural Context", open.context],
                ] as const
              ).map(([a, b]) => (
                <div key={a} className="dl__item">
                  <dt>{a}</dt>
                  <dd>{b}</dd>
                </div>
              ))}
            </dl>

            <div className="modal__columns">
              <div className="modal__ingCol">
                <p className="kicker">Mise en Place</p>
                <h3>Ingredients</h3>
                <p className="modal__hint">Click any ingredient to check it off as you cook.</p>
                <ul className="ingList">
                  {open.ingredients.map((i, idx) => {
                    const key = `${idx}-${i}`;
                    const done = !!checkedIng[key];
                    return (
                      <li
                        key={key}
                        className={done ? "ingList__item ingList__item--done" : "ingList__item"}
                        onClick={() => setCheckedIng((c) => ({ ...c, [key]: !c[key] }))}
                      >
                        <span className="ingCheck" aria-hidden="true">
                          {done ? "✓" : ""}
                        </span>
                        <span>{i}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="modal__stepCol">
                <p className="kicker">Preparation &amp; Ritual</p>
                <h3>Method</h3>
                <ol className="stepList">
                  {open.steps.map((s, idx) => (
                    <li key={`${idx}-${s.slice(0, 20)}`} className="stepList__item">
                      <span className="stepNum">{String(idx + 1).padStart(2, "0")}</span>
                      <p>{s}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="modal__footer">
              <p className="tags">
                {open.tags.map((t, idx) => (
                  <span key={`${idx}-${t}`} className="tag">
                    {t}
                  </span>
                ))}
              </p>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
