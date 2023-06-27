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
    'vcm_xrp96dwgppv2',
    'vcm_84awjbjxts6n',
    'vcm_b2x2sn8kf28j',
    'vcm_41nw6xgr5x3v',
    'vcm_a6x83tk0ttf2',
    'vcm_dgjgqxq5w97j',
    'vcm_59k5j452x7xy',
    'vcm_09p6vqnk7n05',
    'vcm_attanwh383hg',
    'vcm_t8d4f6w9pa8t',
    'vcm_s8s4q4c65xsy',
    'vcm_6e2av8pmkyz5',
    'vcm_82x5f330z4wf',
    'vcm_z6bax4kvjdx6',
    'vcm_v8hf35cyq3ft',
    'vcm_1h9b4v6nxmf5',
    'vcm_781bzn81qf6k',
    'vcm_w0xjjsexktby',
    'vcm_awsq3q4c711w'
);

-- Remove duplicate models
update voice_conversion_models
set
    mod_deleted_at = NOW(),
    maybe_mod_comments = 'takedown request'
where token IN (
    'vcm_2af74np3jh6q',
    'vcm_8kk7355dc184'
);






