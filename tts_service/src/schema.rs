table! {
    sentences (id) {
        id -> Integer,
        sentence -> Varchar,
        speaker -> Nullable<Varchar>,
        ip_address -> Nullable<Varchar>,
        created_at -> Datetime,
    }
}
