import { useState } from "react";
import { ref, set, remove } from "firebase/database";
import { db } from "../firebase";

const LOOT_DROP_FIELDS = {
  dropChance: "number",
  isGuaranteed: "boolean",
  itemID: "number",
  itemName: "text",
  maxAmount: "number",
  minAmount: "number",
};

const SECTIONS = [
  {
    label: null,
    fields: ["enemyName", "description"],
  },
  {
    label: "Enemy Settings",
    fields: ["healthPoints", "experienceToGive"],
  },
  {
    label: "Movement Settings",
    fields: ["speed", "timeToWait"],
  },
  {
    label: "Attack Settings",
    fields: ["damageToGive", "detectionRadius", "defense", "knockbackForceX", "knockbackForceY", "pursuitMultiplier"],
  },
  {
    label: "Respawn Settings",
    fields: ["shouldRespawn", "timeToReset", "timeToRespawn"],
  },
  {
    label: "Loot Settings",
    fields: ["lootDrops"],
  },
];

const FIELD_TYPES = {
  behaviorType: "text",
  damageToGive: "number",
  defense: "number",
  description: "text",
  detectionRadius: "number",
  enemyName: "text",
  experienceToGive: "number",
  healthPoints: "number",
  isBoss: "boolean",
  knockbackForceX: "number",
  knockbackForceY: "number",
  lootDrops: "loot",
  pursuitMultiplier: "number",
  shouldReactToAttack: "boolean",
  shouldRespawn: "boolean",
  speed: "number",
  timeToReset: "number",
  timeToRespawn: "number",
  timeToWait: "number",
};

function LootDropEditor({ drops, onChange }) {
  const [open, setOpen] = useState(false);
  const list = Array.isArray(drops) ? drops : Object.values(drops ?? {});

  function updateDrop(index, subField, value) {
    const updated = list.map((drop, i) =>
      i === index ? { ...drop, [subField]: value } : drop
    );
    onChange(updated);
  }

  function renderSubField(index, subField, value, type) {
    if (type === "boolean") {
      return (
        <select
          value={String(value)}
          onChange={(e) => updateDrop(index, subField, e.target.value === "true")}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }
    if (type === "number") {
      return (
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => updateDrop(index, subField, Number(e.target.value))}
        />
      );
    }
    return (
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => updateDrop(index, subField, e.target.value)}
      />
    );
  }

  return (
    <div className="loot-section">
      <button className="loot-toggle" type="button" onClick={() => setOpen((o) => !o)}>
        <span>lootDrops</span>
        <span className="loot-count">{list.length} drop{list.length !== 1 ? "s" : ""}</span>
        <span className="loot-chevron">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="loot-drops">
          {list.map((drop, index) => (
            <div className="loot-drop-entry" key={index}>
              <div className="loot-drop-title">Drop #{index + 1} — {drop.itemName ?? "?"}</div>
              {Object.entries(LOOT_DROP_FIELDS).map(([subField, type]) => (
                <div className="enemy-field loot-subfield" key={subField}>
                  <label>{subField}</label>
                  {renderSubField(index, subField, drop[subField], type)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EnemyCard({ categoryName, enemyName, stats, dbPath, enemyNodePath, allCategories }) {
  const [values, setValues] = useState({ ...stats });
  const [selectedCategory, setSelectedCategory] = useState(categoryName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      if (selectedCategory !== categoryName) {
        // Move enemy to new category: write to new path, delete old node
        const newStatsPath = `EnemySettings/Categories/${selectedCategory}/${enemyName}/enemyStats`;
        await set(ref(db, newStatsPath), values);
        await remove(ref(db, enemyNodePath));
      } else {
        await set(ref(db, dbPath), values);
      }
      setSaved(true);
    } catch (err) {
      setError("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function renderField(field, value) {
    const type = FIELD_TYPES[field] ?? (typeof value === "boolean" ? "boolean" : typeof value === "number" ? "number" : "text");

    if (field === "description") {
      return (
        <textarea
          className="field-textarea"
          value={value ?? ""}
          onChange={(e) => handleChange(field, e.target.value)}
          rows={3}
        />
      );
    }

    if (type === "loot") {
      return (
        <LootDropEditor
          drops={value}
          onChange={(updated) => handleChange(field, updated)}
        />
      );
    }

    if (type === "boolean") {
      return (
        <select
          value={String(value)}
          onChange={(e) => handleChange(field, e.target.value === "true")}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    if (type === "number") {
      return (
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => handleChange(field, Number(e.target.value))}
        />
      );
    }

    return (
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => handleChange(field, e.target.value)}
      />
    );
  }

  return (
    <div className={`enemy-card ${expanded ? "enemy-card--expanded" : ""}`}>
      <div className="enemy-card-header" onClick={() => setExpanded((v) => !v)}>
        <div className="enemy-card-header-top">
          <h3>{enemyName}</h3>
          <span className="card-chevron">{expanded ? "▲" : "▼"}</span>
        </div>
        <div className="enemy-card-header-bottom" onClick={(e) => e.stopPropagation()}>
          <label className="category-label">Category</label>
          <select
            className="category-select"
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setSaved(false); }}
          >
            {(allCategories ?? [categoryName]).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Collapsed quick-edit row */}
      {!expanded && (
        <div className="card-collapsed">
          <div className="collapsed-field">
            <label>HP</label>
            <input type="number" value={values.healthPoints ?? ""} onChange={(e) => handleChange("healthPoints", Number(e.target.value))} />
          </div>
          <div className="collapsed-field">
            <label>EXP</label>
            <input type="number" value={values.experienceToGive ?? ""} onChange={(e) => handleChange("experienceToGive", Number(e.target.value))} />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="collapsed-footer">
            {saved && <span className="saved-badge">Saved!</span>}
            <button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Expanded full editor */}
      {expanded && (
        <>
          <div className="enemy-fields">
            {(() => {
              const sectionedFields = SECTIONS.flatMap((s) => s.fields);
              const remainderFields = Object.keys(values).filter((f) => !sectionedFields.includes(f));
              const allSections = [
                ...SECTIONS,
                ...(remainderFields.length > 0 ? [{ label: "Other", fields: remainderFields }] : []),
              ];

              return allSections.map((section) => {
                const present = section.fields.filter((f) => f in values);
                if (present.length === 0) return null;
                return (
                  <div className="field-section" key={section.label ?? "__top"}>
                    {section.label && <div className="field-section-label">{section.label}</div>}
                    {present.map((field) => (
                      <div className="enemy-field-row" key={field}>
                        {field === "lootDrops" ? (
                          renderField(field, values[field])
                        ) : (
                          <div className="enemy-field">
                            <label>{field}</label>
                            {renderField(field, values[field])}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              });
            })()}
          </div>
          {error && <p className="error" style={{padding: "0 1rem"}}>{error}</p>}
          <div className="enemy-card-footer">
            {saved && <span className="saved-badge">Saved!</span>}
            <button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
