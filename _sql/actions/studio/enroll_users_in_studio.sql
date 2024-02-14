-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Staff
-- teddanson is victor's alt
-- SELECT token, username FROM users WHERE username IN (
UPDATE users SET can_access_studio = true WHERE username IN (
    'bflat',
    'brandon',
    'crossproduct',
    'crossproduct1',
    'echelon',
    'fyscott',
    'olivicmic',
    'saltacc',
    'teddanson',
    'vegito1089',
    'wilwong',
    'yae_ph',
    'zzz_last_item'
);

UPDATE users SET can_access_studio = true WHERE username IN (
    'endtimes',
    'tropicalfun',
    'zzz_last_item'
);
