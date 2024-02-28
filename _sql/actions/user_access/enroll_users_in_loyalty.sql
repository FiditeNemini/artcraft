-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Upgrade top TTS model uploaders to a loyalty plan
update users
set maybe_loyalty_program_key = 'fakeyou_contributor'
where token IN (
    select creator_user_token from
        (
            select count(*) as upload_count,
                   creator_user_token
            from tts_models
            group by creator_user_token
            having upload_count >= 10
            order by upload_count desc
        ) as t
);

-- Upgrade top VC model uploaders to a loyalty plan
update users
set maybe_loyalty_program_key = 'fakeyou_contributor'
where token IN (
    select creator_user_token from
        (
            select count(*) as upload_count,
                   creator_user_token
            from voice_conversion_models
            group by creator_user_token
            having upload_count >= 10
            order by upload_count desc
        ) as t
);


-- Staff
-- teddanson is victor's alt
-- endtimes is @sugarbro (testing)
-- el_cid_93 is for testing
-- NB: 'echelon' is absent
-- SELECT token, username FROM users WHERE username IN (
UPDATE users SET maybe_loyalty_program_key = 'fakeyou_contributor' WHERE username IN (
  'bflat',
  'brandon',
  'crossproduct',
  'crossproduct1',
  'el_cid_93',
  'endtimes',
  'fyscott',
  'gateway',
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

UPDATE users SET maybe_loyalty_program_key = 'fakeyou_contributor' WHERE username IN (
  'endtimes',
  'tropicalfun',
  'zzz_last_item'
);
