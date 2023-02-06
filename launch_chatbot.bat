REM Comments on windows use "REM". Weird-ass platform.

REM Make sure migrations are up to date
pushd crates\programs\aichatbot-sidecar
diesel migration run
popd

REM Start the sidecar
DATABASE_URL=sqlite://runtime_data/database.db cargo run --bin aichatbot-sidecar

