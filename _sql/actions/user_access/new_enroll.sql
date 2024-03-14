-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Staff (1)
--  * teddanson is victor's alt
UPDATE users
SET
    can_access_studio = false,
    maybe_feature_flags = 'explore_media,studio,video_style_transfer'
WHERE username IN (
    'bflat',
    'brandon',
    'crossproduct',
    'crossproduct1',
    'echelon',
    'kasisnu',
    'olivicmic',
    'saltacc',
    'teddanson',
    'vegito1089',
    'wilwong',
    'zzz_last_item'
);

-- Staff (2)
--  * devdude123 is Joel
--  * el_cid_93 is for testing (who is this??)
--  * endtimes is @sugarbro (testing)
--  * tammieteller is Tammie (Pebblebed)
UPDATE users
SET
    can_access_studio = false,
    maybe_feature_flags = 'studio,video_style_transfer'
WHERE username IN (
    'dannymcgee',
    'devdude123',
    'el_cid_93',
    'endtimes',
    'fyscott',
    'gateway',
    'jags111',
    'justinjohn0306',
    'mrvintage',
    'rewin123',
    'tropicalfun',
    'yae_ph',
    'zzz_last_item'
);

-- Early access (investors)
UPDATE users
SET
    can_access_studio = false,
    maybe_feature_flags = 'studio,video_style_transfer'
WHERE username IN (
    'vagata',
    'tammieteller',
    'zzz_last_item'
);

-- Early access to VST only
UPDATE users
SET
    can_access_studio = false,
    maybe_feature_flags = 'video_style_transfer'
WHERE username IN (
    'fuxta',
    'kenjoplays',
    'ofccccccc',
    'sonicgt2',
    'stewiegroffin',
    'tanooki426',
    'wawoul',
    'waynut',
    'zzz_last_item'
);

