

INSERT INTO user_roles
SET 
  slug = 'user',
  name = 'User',
  can_ban_users = FALSE,
  can_edit_other_users_data = FALSE,
  can_approve_w2l_templates = FALSE,
  can_upload_tts_models = TRUE,
  can_upload_w2l_templates = TRUE,
  can_use_tts = TRUE,
  can_use_w2l = TRUE;

INSERT INTO user_roles
SET 
  slug = 'mod',
  name = 'Moderator',
  can_ban_users = TRUE,
  can_edit_other_users_data = TRUE,
  can_approve_w2l_templates = TRUE,
  can_upload_tts_models = TRUE,
  can_upload_w2l_templates = TRUE,
  can_use_tts = TRUE,
  can_use_w2l = TRUE;

INSERT INTO user_roles
SET 
  slug = 'admin',
  name = 'Admin',
  can_ban_users = TRUE,
  can_edit_other_users_data = TRUE,
  can_approve_w2l_templates = TRUE,
  can_upload_tts_models = TRUE,
  can_upload_w2l_templates = TRUE,
  can_use_tts = TRUE,
  can_use_w2l = TRUE;

