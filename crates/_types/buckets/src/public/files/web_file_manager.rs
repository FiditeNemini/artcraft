
pub struct FileBucketPath {
    pub bucket_clients: BucketClients
}

impl web_file_manager {
    pub fn new(my_field: i32) -> Self {
        web_file_manager { my_field }
    }

    pub fn increment(&mut self) {
        self.my_field += 1;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new() {
        let my_class = web_file_manager::new(10);
        assert_eq!(my_class.my_field, 10);
    }

    #[test]
    fn test_increment() {
        let mut my_class = web_file_manager::new(10);
        my_class.increment();
        assert_eq!(my_class.my_field, 11);
    }
}