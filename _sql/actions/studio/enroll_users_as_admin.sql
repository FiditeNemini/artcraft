-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Staff
-- teddanson is victor's alt
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
  'saltacc',
  'teddanson',
  'vegito1089',
  'wilwong',
  'yae_ph',
  'zzz_last_item'
);

