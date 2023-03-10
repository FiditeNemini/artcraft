use crate::middleware::ip_filter::ip_ban_list::ip_ban_list::IpBanList;
use crate::middleware::ip_filter::ip_ban_list::load_ip_set_from_file::load_ip_set_from_file;
use errors::AnyhowResult;
use std::path::Path;

pub fn load_ip_ban_list_from_directory<P: AsRef<Path>>(path: P) -> AnyhowResult<IpBanList> {
  let ip_ban_list = IpBanList::new();
  let paths = std::fs::read_dir(path)?;

  for entry in paths {
    let path = entry?.path();
    let path_name = path.to_string_lossy().to_string();
    let ip_set = load_ip_set_from_file(path)?;
    ip_ban_list.add_set(path_name, ip_set)?;
  }

  Ok(ip_ban_list)
}

#[cfg(test)]
mod tests {
  use std::path::PathBuf;
  use crate::middleware::ip_filter::ip_ban_list::load_ip_ban_list_from_directory::load_ip_ban_list_from_directory;

  fn test_file(path_from_repo_root: &str) -> PathBuf {
    // https://doc.rust-lang.org/cargo/reference/environment-variables.html
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push(format!("../../../{}", path_from_repo_root));
    path
  }

  #[test]
  fn test_load_ip_ban_list_from_directory() {
    let directory = test_file("test_data/text_files/ip_ban_example/");
    let ip_set = load_ip_ban_list_from_directory(directory).unwrap();

    // Comments are not included
    assert_eq!(ip_set.contains_ip_address("# this is test data").unwrap(), false);

    // IP addresses in both files are
    assert_eq!(ip_set.contains_ip_address("127.0.0.1").unwrap(), true);
    assert_eq!(ip_set.contains_ip_address("192.168.0.1").unwrap(), true);
  }
}
