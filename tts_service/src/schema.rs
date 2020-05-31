table! {
    sentences (id) {
        id -> Integer,
        sentence -> Varchar,
        ip_address -> Nullable<Varchar>,
        created_at -> Datetime,
    }
}
