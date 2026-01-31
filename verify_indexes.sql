-- Verify indexes installed for PostgreSQL
-- Run this script to check if performance indexes are installed

SELECT 
    tablename as table_name,
    indexname as index_name,
    indexdef as index_definition
FROM 
    pg_indexes
WHERE 
    schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY 
    tablename, indexname;
