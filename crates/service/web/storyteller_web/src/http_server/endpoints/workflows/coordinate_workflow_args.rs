use actix_web_lab::__reexports::tracing::info;

pub struct CoordinatedWorkflowArgs {
  /// Use lipsync in the workflow
  pub use_lipsync: Option<bool>,

  /// Use face detailer
  /// Only for premium accounts
  pub use_face_detailer: Option<bool>,

  /// Use video upscaler
  /// Only for premium accounts
  pub use_upscaler: Option<bool>,

  /// Disable LCM
  /// Don't let ordinary users do this.
  /// Non-LCM workflows take a long time.
  pub disable_lcm: Option<bool>,

  /// Use the cinematic workflow
  /// Don't let ordinary users do this.
  pub use_cinematic: Option<bool>,

  /// Remove watermark from the output
  /// Only for premium accounts
  pub remove_watermark: Option<bool>,
}

pub fn coordinate_workflow_args(mut args: CoordinatedWorkflowArgs, is_staff: bool) -> CoordinatedWorkflowArgs {
  if !is_staff {
    // Non-staff cannot use these workflows
    args.disable_lcm = None;
    args.use_cinematic = None;
    args.remove_watermark = None;
  }

  if args.use_cinematic == Some(true) {
    // use_cinematic has a built-in upscaler
    args.use_upscaler = None;

    // non-lcm is a different workflow.
    //
    // Yae on cinematic vs. non-LCM: "thats...really hard to predict. I would say that current
    // LCM stands pretty confidently against non-LCM, especially considering rendering time.
    // but non-LCM have a chance to give more detailer background and a more saturated picture,
    // but again, it is very checkpoint-related.  Personally, I still use non-lcm for my own
    // projects, but some styles just looks better with LCM."
    args.disable_lcm = None;
  }

  if args.use_lipsync == Some(true) {
    // can't use face detailer and lipsync together
    args.use_face_detailer = None;
  }

  // you can still use upscaler for non-lcm version (it will just take a while)

  args
}

#[cfg(test)]
mod tests {
  #[test]
  fn test_cinematic_and_upscaler() {
    let args = super::CoordinatedWorkflowArgs {
      use_lipsync: None,
      use_face_detailer: None,
      use_upscaler: Some(true),
      disable_lcm: None,
      use_cinematic: Some(true),
      remove_watermark: None,
    };

    let coordinated_args = super::coordinate_workflow_args(args, false);

    assert_eq!(coordinated_args.use_lipsync, None);
    assert_eq!(coordinated_args.use_face_detailer, None);
    assert_eq!(coordinated_args.use_upscaler, None);
    assert_eq!(coordinated_args.disable_lcm, None);
    assert_eq!(coordinated_args.use_cinematic, Some(true));
  }

  #[test]
  fn test_cinematic_and_disable_lcm() {
    let args = super::CoordinatedWorkflowArgs {
      use_lipsync: None,
      use_face_detailer: None,
      use_upscaler: None,
      disable_lcm: Some(true),
      use_cinematic: Some(true),
      remove_watermark: None,
    };

    let coordinated_args = super::coordinate_workflow_args(args, false);

    assert_eq!(coordinated_args.use_lipsync, None);
    assert_eq!(coordinated_args.use_face_detailer, None);
    assert_eq!(coordinated_args.use_upscaler, None);
    assert_eq!(coordinated_args.disable_lcm, None);
    assert_eq!(coordinated_args.use_cinematic, Some(true));
  }

  #[test]
  fn test_lipsync_and_face_detailer() {
    let args = super::CoordinatedWorkflowArgs {
      use_lipsync: Some(true),
      use_face_detailer: Some(true),
      use_upscaler: None,
      disable_lcm: None,
      use_cinematic: None,
      remove_watermark: None,
    };

    let coordinated_args = super::coordinate_workflow_args(args, false);

    assert_eq!(coordinated_args.use_lipsync, Some(true));
    assert_eq!(coordinated_args.use_face_detailer, None);
    assert_eq!(coordinated_args.use_upscaler, None);
    assert_eq!(coordinated_args.disable_lcm, None);
    assert_eq!(coordinated_args.use_cinematic, None);
  }
}
