#[cfg(test)]
mod tests {
    use super::*;
    use tokio;

    #[test]
    fn test_database_connection() {
        let result = std::panic::catch_unwind(|| {
            connect_db();
        });
        assert!(result.is_ok(), "Database connection failed");
    }

    #[tokio::test]
    async fn test_get_block_height() {
        let http_client = HttpClient::new();
        let height = get_block_height(&http_client).await;
        assert!(height.is_ok(), "Failed to fetch block height");
        assert!(height.unwrap() > 0, "Block height should be greater than 0");
    }

    #[test]
    fn test_insert_block_height() {
        let mut client = connect_db();
        let result = insert_block_height(&mut client, 700000);
        assert!(result.is_ok(), "Failed to insert block height");
    }
}
