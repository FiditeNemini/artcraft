use std::process::Command;

use log::info;

use errors::AnyhowResult;

pub fn delete_pods(pod_names: Vec<String>) -> AnyhowResult<()> {
  //let pod_names = pod_names.join(" ");

  let mut args = Vec::from(["delete".to_string(), "pods".to_string()]);

  args.extend(pod_names);

  let output = Command::new("kubectl")
      .args(args)
      .output()?;

  let stdout = String::from_utf8(output.stdout)?;

  info!("Output: {}", stdout);

  Ok(())
}
