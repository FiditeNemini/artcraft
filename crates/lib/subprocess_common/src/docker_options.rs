/// Options for launching subprocesses under a docker container
#[derive(Clone)]
pub struct DockerOptions {
  pub image_name: String,
  pub maybe_bind_mount: Option<DockerFilesystemMount>,
  pub maybe_gpu: Option<DockerGpu>,
}

#[derive(Clone)]
pub struct DockerFilesystemMount {
  pub local_filesystem: String,
  pub container_filesystem: String,
}

#[derive(Clone)]
pub enum DockerGpu {
  All,
  Named(String),
}


impl DockerFilesystemMount {
  pub fn tmp_to_tmp() -> Self {
    Self {
      local_filesystem: "/tmp".to_string(),
      container_filesystem: "/tmp".to_string(),
    }
  }

  pub fn to_fuse_option_string(&self) -> String {
    // TODO: Handle spaces and special characters. Make sure this can't lead to injection.
    format!(" --mount type=bind,source={},target={} ", &self.local_filesystem, &self.container_filesystem)
  }
}

impl DockerGpu {
  pub fn to_option_string(&self) -> String {
    match self {
      DockerGpu::All => " --gpus all ".to_string(),
      // TODO: Handle spaces and special characters. Make sure this can't lead to injection.
      DockerGpu::Named(named) => format!(" --gpus {}", named),
    }
  }
}

impl DockerOptions {
  pub fn to_command_string(&self, container_command: &str) -> String {
    let fuse_command = self.maybe_bind_mount
        .as_ref()
        .map(|mount| mount.to_fuse_option_string())
        .unwrap_or("".to_string());

    let gpu_command = self.maybe_gpu
        .as_ref()
        .map(|gpu| gpu.to_option_string())
        .unwrap_or("".to_string());

    // TODO: Handle spaces and special characters. Make sure this can't lead to injection.
    format!("docker run --rm {} {} {} /bin/bash -c \"{}\"",
            &fuse_command,
            &gpu_command,
            &self.image_name,
            container_command)
  }
}

#[cfg(test)]
mod tests {
  use crate::docker_options::{DockerFilesystemMount, DockerGpu, DockerOptions};

  #[test]
  fn test_command() {
    let command = DockerOptions {
      image_name: "MY_IMAAGE".to_string(),
      maybe_bind_mount: Some(DockerFilesystemMount {
        local_filesystem: "/local".to_string(),
        container_filesystem: "/container".to_string(),
      }),
      maybe_gpu: Some(DockerGpu::All),
    };

    assert_eq!("docker run --rm  --mount type=bind,source=/local,target=/container   --gpus all  MY_IMAAGE /bin/bash -c \"echo wat\"",
               command.to_command_string("echo wat"));
  }
}
