-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Staff
-- teddanson is victor's alt
-- endtimes is @sugarbro (testing)
-- el_cid_93 is for testing
-- SELECT token, username FROM users WHERE username IN (
UPDATE users SET can_access_studio = true WHERE username IN (
    'bflat',
    'brandon',
    'crossproduct',
    'crossproduct1',
    'echelon',
    'el_cid_93',
    'endtimes',
    'fyscott',
    'jags111',
    'mrvintage',
    'olivicmic',
    'rewin123',
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
