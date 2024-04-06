-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Staff
--   * teddanson - victor's alt
--   * printrman - miles
-- SELECT token, username FROM users WHERE username IN (
UPDATE users SET user_role_slug = "admin" WHERE username IN (
  'bflat',
  'brandon',
  'crossproduct',
  'crossproduct1',
  'echelon',
  'fyscott',
  'mrvintage',
  'olivicmic',
  'printrman',
  'saltacc',
  'teddanson',
  'vegito1089',
  'wilwong',
  'yae_ph',
  'zzz_last_item'
);

