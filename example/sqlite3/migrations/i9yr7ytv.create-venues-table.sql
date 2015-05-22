-- up

CREATE TABLE venues (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city_id INTEGER NOT NULL REFERENCES cities(id)
);

---

DROP TABLE venues;

-- down
