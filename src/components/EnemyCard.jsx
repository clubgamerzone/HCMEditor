import { useState } from "react";
import { ref, set } from "firebase/database";
import { db } from "../firebase";

const LOOT_DROP_FIELDS = {
  dropChance: "number",
  isGuaranteed: "boolean",
  itemID: "number",
  itemName: "text",
  maxAmount: "number",
  minAmount: "number",
};

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
  );
}

export default function EnemyCard({ categoryName, enemyName, stats, dbPath }) {
  const [values, setValues] = useState({ ...stats });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await set(ref(db, dbPath), values);
      setSaved(true);
    } catch (err) {
      setError("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function renderField(field, value) {
    const type = FIELD_TYPES[field] ?? (typeof value === "boolean" ? "boolean" : typeof value === "number" ? "number" : "text");

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
    <div className="enemy-card">
      <div className="enemy-card-header">
        <span className="enemy-category">{categoryName}</span>
        <h3>{enemyName}</h3>
      </div>
      <div className="enemy-fields">
        {Object.entries(values).map(([field, value]) => (
          <div className={`enemy-field-row ${field === "lootDrops" ? "loot-row" : ""}`} key={field}>
            {field === "lootDrops" ? (
              <>
                <div className="loot-label">lootDrops</div>
                {renderField(field, value)}
              </>
            ) : (
              <div className="enemy-field">
                <label>{field}</label>
                {renderField(field, value)}
              </div>
            )}
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="enemy-card-footer">
        {saved && <span className="saved-badge">Saved!</span>}
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
