import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase";
import EnemyCard from "../components/EnemyCard";

export default function EnemyEditorPage() {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const settingsRef = ref(db, "EnemySettings/Categories");
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      setCategories(data ?? {});
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categoryNames = Object.keys(categories).filter((c) => c !== "Default");
  const displayCategories = activeCategory ? [activeCategory] : categoryNames;

  function getFilteredEnemies(categoryName) {
    const enemies = categories[categoryName] ?? {};
    return Object.entries(enemies).filter(([name]) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="editor-layout">
      <header className="editor-header">
        <h1>Hell Cemetery — Enemy Settings</h1>
        <button className="logout-btn" onClick={() => signOut(auth)}>
          Sign Out
        </button>
      </header>

      <div className="editor-controls">
        <input
          className="search-input"
          type="text"
          placeholder="Search enemy..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="category-tabs">
          <button
            className={activeCategory === null ? "tab active" : "tab"}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {categoryNames.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? "tab active" : "tab"}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="loading">Loading enemy data...</p>
      ) : (
        <div className="enemy-grid">
          {displayCategories.map((categoryName) =>
            getFilteredEnemies(categoryName).map(([enemyName, enemyData]) => (
              <EnemyCard
                key={`${categoryName}-${enemyName}`}
                categoryName={categoryName}
                enemyName={enemyName}
                stats={enemyData.enemyStats ?? enemyData}
                dbPath={`EnemySettings/Categories/${categoryName}/${enemyName}/enemyStats`}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
