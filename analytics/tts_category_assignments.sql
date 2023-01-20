-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Select TTS models within a category
-- (NOTE CATEGORIES ARE *SOFT DELETED* AND THIS MAY MIS-ATTRIBUTE)
select
    tts.token,
    tts.ietf_language_tag,
    tts.title
from tts_category_assignments as cat
join tts_models as tts
on tts.token = cat.model_token
where
    cat.category_token = 'CAT:n06k9gfgq20';

-- Select TTS models within a category
-- (NOTE CATEGORIES ARE *SOFT DELETED* AND THIS MAY MIS-ATTRIBUTE)
select
    tts.token,
    tts.ietf_language_tag,
    tts.title
from tts_category_assignments as cat
         join tts_models as tts
              on tts.token = cat.model_token
where
        cat.category_token = 'CAT:n06k9gfgq20'
AND cat.deleted_at IS NULL;
