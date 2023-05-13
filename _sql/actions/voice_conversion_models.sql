-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Remove temporary test models
update voice_conversion_models
set
    mod_deleted_at = NOW(),
    maybe_mod_comments = 'temporary test model'
where token IN (
    'vcm_jt9mdz9xjjcb',
    'vcm_4xzkzdhs4kk5',
    'vcm_502wkt2pca3y'
);

-- Remove broken models
update voice_conversion_models
set
    mod_deleted_at = NOW(),
    maybe_mod_comments = 'broken model'
where token IN (
    'vcm_982y9g6v3jrg',
    'vcm_16rpyehf7f0a',
    'vcm_8vjtz3dbnw17',
    'vcm_tc9mwr60cjth',
    'vcm_bshsyp01w9vg',
    'vcm_31whj8apmqj7',
    'vcm_84qa0an44p8p',
    'vcm_9xx4v5qz5fbg',
    'vcm_7zp2b2hs2at2',
    'vcm_zhvk0mnnb7zp',
    'vcm_1vc4scq9qp6m',
    'vcm_sr1b54mwy0ym',
    'vcm_qx96y8aasydk'
);

-- Remove duplicate models
update voice_conversion_models
set
    mod_deleted_at = NOW(),
    maybe_mod_comments = 'duplicate model'
where token IN (
    'vcm_6w21em1bs7q3',
    'vcm_sbhvyj7926w4',
    'vcm_anv469g89adz',
    'vcm_xsx5yx585c7x',
    'vcm_dpahzjjpkf18',
    'vcm_y09dqe6zgwyk',
    'vcm_xrp96dwgppv2'
);





