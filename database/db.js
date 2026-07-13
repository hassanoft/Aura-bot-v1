/**
 * Base de données JSON minimaliste.
 * Conçue pour être facilement remplacée par MongoDB/PostgreSQL/Supabase
 * en gardant la même interface : get, set, has, delete, all.
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');

class JSONDatabase {
  constructor(name) {
    this.dir = path.resolve(config.paths.database);
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
    this.file = path.join(this.dir, `${name}.json`);
    this.data = this._load();
  }

  _load() {
    if (!fs.existsSync(this.file)) {
      fs.writeFileSync(this.file, '{}');
      return {};
    }
    try {
      return JSON.parse(fs.readFileSync(this.file, 'utf-8'));
    } catch {
      return {};
    }
  }

  _save() {
    fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
  }

  get(key, fallback = null) {
    return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : fallback;
  }

  set(key, value) {
    this.data[key] = value;
    this._save();
    return value;
  }

  has(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key);
  }

  delete(key) {
    delete this.data[key];
    this._save();
  }

  all() {
    return this.data;
  }
}

module.exports = {
  users: new JSONDatabase('users'),
  groups: new JSONDatabase('groups'),
  premium: new JSONDatabase('premium'),
  economy: new JSONDatabase('economy'),
  stats: new JSONDatabase('stats'),
};
