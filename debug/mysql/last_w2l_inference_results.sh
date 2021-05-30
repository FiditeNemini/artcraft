#!/bin/bash
# ONLY FOR LOCAL DEV

mysql -u root \
  -proot \
  -h localhost \
  -D storyteller \
  -e "select * from w2l_results\G"


echo '==============================================='

read -r -d '' query << EOF

    SELECT
      w2l_results.token as w2l_result_token,
      w2l_results.maybe_tts_inference_result_token,
      w2l_templates.token as maybe_w2l_template_token,
      w2l_templates.template_type,
      users.token as maybe_creator_user_token,
      users.username as maybe_creator_username,
      users.display_name as maybe_creator_display_name,
      w2l_results.file_size_bytes,
      w2l_results.frame_width,
      w2l_results.frame_height,
      w2l_results.duration_millis,
      w2l_results.created_at,
      w2l_results.updated_at
    FROM
      w2l_results
      LEFT OUTER JOIN w2l_templates ON w2l_results.maybe_w2l_template_token = w2l_templates.token
      LEFT OUTER JOIN users ON w2l_results.maybe_creator_user_token = users.token
    WHERE
      w2l_results.deleted_at IS NULL
      AND users.username = 'echelon'\G
EOF

echo $query

mysql -u root \
  -proot \
  -h localhost \
  -D storyteller \
  -e "${query}"

