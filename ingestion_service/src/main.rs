use postgres::{Client, NoTls};
use dotenv::dotenv;
use std::env;
use reqwest::Client as HttpClient;
use serde::{Deserialize, Serialize};
use tokio::time::{sleep, Duration};
use actix_web::{get, App, HttpServer, Responder, web};
use actix_cors::Cors;

#[derive(Serialize)]
struct RpcRequest<'a> {
    jsonrpc: &'a str,
    method: &'a str,
    params: Vec<&'a str>,
    id: u32,
}

#[derive(Deserialize)]
struct RpcResponse {
    result: Option<i32>,
    error: Option<serde_json::Value>,
    id: u32,
}

#[derive(Serialize)]
struct BlockHeightResponse {
    latest_height: i32,
}

// Function to connect to the database
fn connect_db() -> Client {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL=postgres://explorer_user:1234@localhost/bitcoin_explore?schema=public").expect("DATABASE_URL not set");
    Client::connect(&database_url, NoTls).expect("Failed to connect to database")
}

// Function to get current block height from Bitcoin RPC
async fn get_block_height(http_client: &HttpClient) -> Result<i32, Box<dyn std::error::Error>> {
    let rpc_request = RpcRequest {
        jsonrpc: "1.0",
        method: "getblockcount",
        params: vec![],
        id: 1,
    };

    let response = http_client
        .post(&env::var("http://127.0.0.1:8332")?)
        .basic_auth(
            env::var("username")?,
            Some(env::var("1234")?),
        )
        .json(&rpc_request)
        .send()
        .await?;

    let rpc_response: RpcResponse = response.json().await?;
    if let Some(error) = rpc_response.error {
        Err(format!("RPC Error: {:?}", error).into())
    } else {
        Ok(rpc_response.result.unwrap())
    }
}

// Function to insert block height into the database
fn insert_block_height(client: &mut Client, height: i32) -> Result<(), Box<dyn std::error::Error>> {
    client.execute(
        "INSERT INTO block_height (height) VALUES ($1)",
        &[&height],
    )?;
    Ok(())
}

// API endpoint to get the latest block height
#[get("/api/block_height")]
async fn get_latest_block_height() -> impl Responder {
    let mut client = connect_db();
    let row = client
        .query_one("SELECT height FROM block_height ORDER BY id DESC LIMIT 1", &[])
        .expect("Failed to fetch latest block height");
    let height: i32 = row.get(0);
    let response = BlockHeightResponse {
        latest_height: height,
    };
    web::Json(response)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let mut db_client = connect_db();
    let http_client = HttpClient::new();

    // Spawn a background task for data ingestion
    tokio::spawn(async move {
        loop {
            match get_block_height(&http_client).await {
                Ok(height) => {
                    println!("Current Block Height: {}", height);
                    if let Err(e) = insert_block_height(&mut db_client, height) {
                        eprintln!("Failed to insert block height: {}", e);
                    }
                }
                Err(e) => eprintln!("Error fetching block height: {}", e),
            }
            // Wait for 60 seconds before the next fetch
            sleep(Duration::from_secs(60)).await;
        }
    });

    // Start Actix-web server for API
    HttpServer::new(|| {
        App::new()
            .wrap(Cors::permissive())
            .service(get_latest_block_height)
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
