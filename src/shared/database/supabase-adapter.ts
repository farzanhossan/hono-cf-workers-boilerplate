import { createClient } from "@supabase/supabase-js";
import { DatabaseConnection } from "./database";
import { Env } from "@/types";

export class SupabaseAdapter implements DatabaseConnection {
  private client;

  constructor(env: Env) {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    console.log("🔍 Executing query:", sql);
    console.log("📋 With params:", params);

    try {
      // Parse SQL to extract table name and operation
      const sqlInfo = this.parseSql(sql);
      console.log("📊 Parsed SQL info:", sqlInfo);

      switch (sqlInfo.operation) {
        case "INSERT":
          return await this.handleInsert<T>(sqlInfo, params);

        case "UPDATE":
          return await this.handleUpdate<T>(sqlInfo, params);

        case "SELECT":
          return await this.handleSelect<T>(sqlInfo, params);

        case "DELETE":
          return await this.handleDelete<T>(sqlInfo, params);

        default:
          // Fallback to exec_sql for complex queries
          return await this.handleRawSql<T>(sql, params);
      }
    } catch (error) {
      console.error("❌ Query failed:", error);
      throw error;
    }
  }

  private parseSql(sql: string) {
    const normalizedSql = sql.toLowerCase().trim();

    // Determine operation
    let operation = "UNKNOWN";
    if (normalizedSql.startsWith("select")) operation = "SELECT";
    else if (normalizedSql.startsWith("insert")) operation = "INSERT";
    else if (normalizedSql.startsWith("update")) operation = "UPDATE";
    else if (normalizedSql.startsWith("delete")) operation = "DELETE";

    // Extract table name
    let tableName = "";
    if (operation === "SELECT") {
      const fromMatch = normalizedSql.match(/from\s+(\w+)/);
      tableName = fromMatch ? fromMatch[1] : "";
    } else if (operation === "INSERT") {
      const intoMatch = normalizedSql.match(/insert\s+into\s+(\w+)/);
      tableName = intoMatch ? intoMatch[1] : "";
    } else if (operation === "UPDATE") {
      const updateMatch = normalizedSql.match(/update\s+(\w+)/);
      tableName = updateMatch ? updateMatch[1] : "";
    } else if (operation === "DELETE") {
      const fromMatch = normalizedSql.match(/delete\s+from\s+(\w+)/);
      tableName = fromMatch ? fromMatch[1] : "";
    }

    // Check for special conditions
    const hasReturning = normalizedSql.includes("returning");
    const hasWhere = normalizedSql.includes("where");
    const hasLimit = normalizedSql.includes("limit");
    const hasCount = normalizedSql.includes("count(");

    return {
      operation,
      tableName,
      hasReturning,
      hasWhere,
      hasLimit,
      hasCount,
      originalSql: sql,
    };
  }

  private async handleInsert<T>(sqlInfo: any, params: any[]): Promise<T[]> {
    if (!sqlInfo.hasReturning) {
      // Simple insert without returning
      return await this.handleRawSql<T>(sqlInfo.originalSql, params);
    }

    // INSERT with RETURNING - use Supabase client
    const insertData = this.parseInsertData(sqlInfo.originalSql, params);

    const { data, error } = await this.client
      .from(sqlInfo.tableName)
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data ? [data] : [];
  }

  private async handleUpdate<T>(sqlInfo: any, params: any[]): Promise<T[]> {
    if (!sqlInfo.hasReturning) {
      return await this.handleRawSql<T>(sqlInfo.originalSql, params);
    }

    // UPDATE with RETURNING - use Supabase client
    const { updateData, whereCondition } = this.parseUpdateData(
      sqlInfo.originalSql,
      params
    );

    let query = this.client.from(sqlInfo.tableName).update(updateData);

    // Apply WHERE conditions
    if (whereCondition.column && whereCondition.value) {
      query = query.eq(whereCondition.column, whereCondition.value);
    }

    const { data, error } = await query.select().single();

    if (error) throw error;
    return data ? [data] : [];
  }

  private async handleSelect<T>(sqlInfo: any, params: any[]): Promise<T[]> {
    console.log("🔍 Handling SELECT for table:", sqlInfo.tableName);

    // Handle COUNT queries
    if (sqlInfo.hasCount) {
      console.log("🔢 Handling COUNT query");
      const { count, error } = await this.client
        .from(sqlInfo.tableName)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("❌ Count error:", error);
        throw error;
      }
      console.log("✅ Count result:", count);
      return [{ count }] as T[];
    }

    // Start building the query
    let query = this.client.from(sqlInfo.tableName).select("*");

    // Parse WHERE conditions
    const whereConditions = this.parseWhereConditions(
      sqlInfo.originalSql,
      params
    );
    console.log("🔍 WHERE conditions:", whereConditions);

    whereConditions.forEach((condition) => {
      if (condition.operator === "=") {
        query = query.eq(condition.column, condition.value);
      } else if (condition.operator === "ILIKE") {
        query = query.ilike(condition.column, condition.value);
      }
    });

    // Handle ORDER BY
    const orderBy = this.parseOrderBy(sqlInfo.originalSql);
    console.log("📋 ORDER BY:", orderBy);
    if (orderBy.column) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending });
    }

    // Handle LIMIT and OFFSET
    if (sqlInfo.hasLimit) {
      const { limit, offset } = this.parseLimitOffset(
        sqlInfo.originalSql,
        params
      );
      console.log("📄 LIMIT/OFFSET:", { limit, offset });

      if (limit !== undefined && offset !== undefined) {
        // Use range method correctly
        const startIndex = offset;
        const endIndex = offset + limit - 1;
        query = query.range(startIndex, endIndex);
      } else if (limit !== undefined) {
        query = query.limit(limit);
      }
    }

    console.log("🔄 Executing Supabase query...");
    const { data, error } = await query;

    if (error) {
      console.error("❌ Select error:", error);
      throw error;
    }

    // console.log("✅ Select result:", data);
    return data || [];
  }

  private async handleDelete<T>(sqlInfo: any, params: any[]): Promise<T[]> {
    const whereConditions = this.parseWhereConditions(
      sqlInfo.originalSql,
      params
    );

    let query = this.client.from(sqlInfo.tableName).delete();

    whereConditions.forEach((condition) => {
      if (condition.operator === "=") {
        query = query.eq(condition.column, condition.value);
      }
    });

    const { error } = await query;
    if (error) throw error;

    return [];
  }

  private async handleRawSql<T>(sql: string, params: any[]): Promise<T[]> {
    console.log("⚡ Using exec_sql for complex query");
    const processedSql = this.replacePlaceholders(sql, params);

    const { data, error } = await this.client.rpc("exec_sql", {
      sql: processedSql,
    });

    if (error) throw error;
    return data || [];
  }

  // Helper methods for parsing SQL
  private parseInsertData(sql: string, params: any[]) {
    // For JSONB data structure
    if (params.length === 1 && typeof params[0] === "string") {
      try {
        return { data: JSON.parse(params[0]) };
      } catch {
        return { data: params[0] };
      }
    }

    // Handle other insert patterns
    return params[0];
  }

  private parseUpdateData(sql: string, params: any[]) {
    // Simplified - assumes first param is data, last param is ID
    const updateData =
      typeof params[0] === "string"
        ? { data: JSON.parse(params[0]) }
        : params[0];

    const whereCondition = {
      column: "id",
      value: params[params.length - 1],
    };

    return { updateData, whereCondition };
  }

  private parseWhereConditions(sql: string, params: any[]) {
    const conditions = [];

    // Basic WHERE id = $1 pattern
    if (sql.includes("WHERE id =")) {
      conditions.push({
        column: "id",
        operator: "=",
        value: params[0],
      });
    }

    // JSONB email pattern: WHERE data->>'email' = $1
    if (sql.includes("data->>'email'")) {
      conditions.push({
        column: "data->>email",
        operator: "=",
        value: params[0],
      });
    }

    // Add more patterns as needed

    return conditions;
  }

  private parseLimitOffset(sql: string, params: any[]) {
    console.log("📊 Parsing LIMIT/OFFSET from SQL:", sql);
    console.log("📊 Available params:", params);

    // Look for LIMIT $1 OFFSET $2 pattern
    const limitMatch = sql.match(/LIMIT\s+\$(\d+)/i);
    const offsetMatch = sql.match(/OFFSET\s+\$(\d+)/i);

    let limit, offset;

    if (limitMatch) {
      const paramIndex = parseInt(limitMatch[1]) - 1; // Convert to 0-based index
      limit = params[paramIndex];
      console.log(
        "📊 Found LIMIT param at index:",
        paramIndex,
        "value:",
        limit
      );
    }

    if (offsetMatch) {
      const paramIndex = parseInt(offsetMatch[1]) - 1; // Convert to 0-based index
      offset = params[paramIndex];
      console.log(
        "📊 Found OFFSET param at index:",
        paramIndex,
        "value:",
        offset
      );
    }

    // Handle the specific case from your query: LIMIT $1 OFFSET $2
    // where params are [10, 0]
    if (params.length >= 2 && limitMatch && offsetMatch) {
      limit = params[0]; // First param is limit
      offset = params[1]; // Second param is offset
    }

    console.log("📊 Parsed LIMIT/OFFSET:", { limit, offset });
    return { limit, offset };
  }

  private parseOrderBy(sql: string) {
    const orderMatch = sql.match(/ORDER BY\s+(\w+)(\s+(ASC|DESC))?/i);

    if (orderMatch) {
      return {
        column: orderMatch[1],
        ascending: !orderMatch[3] || orderMatch[3].toUpperCase() === "ASC",
      };
    }

    return { column: null, ascending: true };
  }

  private replacePlaceholders(sql: string, params: any[]): string {
    let processedSql = sql;
    params.forEach((param, index) => {
      const placeholder = `$${index + 1}`;
      let value: string;

      if (typeof param === "string") {
        value = `'${param.replace(/'/g, "''")}'`;
      } else if (typeof param === "object") {
        value = `'${JSON.stringify(param)}'::jsonb`;
      } else {
        value = String(param);
      }

      processedSql = processedSql.replace(placeholder, value);
    });

    return processedSql;
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  async execute(
    sql: string,
    params: any[] = []
  ): Promise<{ rowCount: number }> {
    await this.query(sql, params);
    return { rowCount: 1 };
  }
}
