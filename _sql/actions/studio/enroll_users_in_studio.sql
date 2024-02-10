-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Staff
-- SELECT token, username FROM users WHERE username IN (
UPDATE users SET can_access_studio = true WHERE username IN (
    'bflat',
    'crossproduct1',
    'echelon',
    'fyscott',
    'olivicmic',
    'saltacc',
    'wilwong',
    'zzz_last_item'
);
