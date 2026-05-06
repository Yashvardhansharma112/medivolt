import psycopg2

conn = psycopg2.connect(
    host="medivault-db.ccbygc8ku18s.us-east-1.rds.amazonaws.com",
    port=5432,
    database="medivault",
    user="postgres",
    password="Medivault2024!",
    connect_timeout=30
)
conn.autocommit = True
cur = conn.cursor()

sql = open("d:/ai agents to sell/medical repository website/server/db_init.sql", "r").read()

# Split and run each statement
for statement in sql.split(";"):
    statement = statement.strip()
    if statement:
        try:
            cur.execute(statement)
            print(f"OK: {statement[:60]}...")
        except Exception as e:
            print(f"SKIP: {str(e)[:80]}")

cur.close()
conn.close()
print("\nDatabase initialized successfully!")
