-- up

CREATE TABLE cities (
  id INTEGER PRIMARY KEY,
  country_id INTEGER NOT NULL REFERENCES countries(id),
  name TEXT NOT NULL
);
