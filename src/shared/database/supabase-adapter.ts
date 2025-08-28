import { createClient } from "@supabase/supabase-js";
import { DatabaseConnection } from "./database";
import { Env } from "@/types";

export class SupabaseAdapter implements DatabaseConnection {
  constructor(env: Env) {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    console.log("Executing query:", sql);
    console.log("With params:", params);

    try {
      // For complex queries with specific columns, JOINs, JSONB operations, or quotes - use raw SQL
      if (this.shouldUseRawSql(sql)) {
        console.log("Using raw SQL execution");
        return await this.executeRawSql<T>(sql, params);
      }

      // Simple queries - try Supabase query builder
      const sqlInfo = this.analyzeSql(sql);
      console.log("Query analysis:", sqlInfo);

      switch (sqlInfo.operation) {
        case "SELECT":
          return await this.executeSelect<T>(sqlInfo, params);
        case "INSERT":
          return await this.executeInsert<T>(sqlInfo, params);
        case "UPDATE":
          return await this.executeUpdate<T>(sqlInfo, params);
        case "DELETE":
          return await this.executeDelete<T>(sqlInfo, params);
        default:
          return await this.executeRawSql<T>(sql, params);
      }
    } catch (error) {
      console.error("Query failed:", error);
      throw new Error(`Database Error: ${error.message}`);
    }
  }

  shouldUseRawSql(sql: string): boolean {
    const normalizedSql = sql.toLowerCase();

    // Check for complex patterns that need raw SQL
    const complexPatterns = [
      sql.includes('"'), // Quoted identifiers
      sql.includes("||"), // String concatenation
      sql.includes("jsonb_build_object"), // JSONB functions
      normalizedSql.includes("join "), // Any type of JOIN
      normalizedSql.includes("union"), // UNION queries
      normalizedSql.includes("with "), // CTEs
      normalizedSql.includes("over ("), // Window functions
      /\(\s*select/.test(normalizedSql), // Subqueries
      this.hasSpecificColumns(sql), // Specific column selection
    ];

    return complexPatterns.some((pattern) => pattern);
  }

  hasSpecificColumns(sql: string): boolean {
    const selectMatch = sql.match(/select\s+(.*?)\s+from/i);
    if (!selectMatch) return false;

    const columnsPart = selectMatch[1].trim();
    return columnsPart !== "*";
  }

  analyzeSql(sql: string) {
    const normalizedSql = sql.toLowerCase().trim();

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

    return {
      operation,
      tableName,
      hasWhere: normalizedSql.includes("where"),
      hasLimit: normalizedSql.includes("limit"),
      hasCount: /count\s*\(/.test(normalizedSql),
      hasReturning: normalizedSql.includes("returning"),
      originalSql: sql,
    };
  }

  async executeSelect<T>(sqlInfo: any, params: any[]): Promise<T[]> {
    console.log("Handling SELECT for table:", sqlInfo.tableName);

    // Handle COUNT queries
    if (sqlInfo.hasCount && !sqlInfo.hasWhere) {
      console.log("Handling COUNT query");
      const { count, error } = await this.client
        .from(sqlInfo.tableName)
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return [{ count }] as T[];
    }

    // Build basic query
    let query = this.client.from(sqlInfo.tableName).select("*");

    // Basic WHERE handling
    if (sqlInfo.hasWhere && params.length > 0) {
      if (sqlInfo.originalSql.includes("WHERE id =")) {
        query = query.eq("id", params[0]);
      }
    }

    // Basic ORDER BY handling
    if (sqlInfo.originalSql.toLowerCase().includes("order by")) {
      const orderMatch = sqlInfo.originalSql.match(
        /order\s+by\s+(\w+)\s*(asc|desc)?/i
      );
      if (orderMatch) {
        const column = orderMatch[1];
        const ascending =
          !orderMatch[2] || orderMatch[2].toLowerCase() === "asc";
        query = query.order(column, { ascending });
      }
    }

    // Basic LIMIT/OFFSET handling
    if (sqlInfo.hasLimit) {
      const limitMatch = sqlInfo.originalSql.match(/LIMIT\s+\$(\d+)/i);
      const offsetMatch = sqlInfo.originalSql.match(/OFFSET\s+\$(\d+)/i);

      if (limitMatch && offsetMatch) {
        const limit = params[0];
        const offset = params[1];
        query = query.range(offset, offset + limit - 1);
      } else if (limitMatch) {
        query = query.limit(params[0]);
      }
    }

    console.log("Executing Supabase query...");
    const { data, error } = await query;

    if (error) {
      console.error("Select error:", error);
      throw error;
    }

    return data || [];
  }

  async executeInsert<T>(sqlInfo: any, params: any[]): Promise<T[]> {
    const insertData = this.parseInsertData(sqlInfo.originalSql, params);

    let query = this.client.from(sqlInfo.tableName).insert(insertData);

    if (sqlInfo.hasReturning) {
      query = query.select();
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  async executeUpdate<T>(sqlInfo: any, params: any[]): Promise<T[]> {
    // Simple update parsing
    let updateData: any = {};
    let whereValue: any;

    if (params.length >= 2) {
      updateData =
        typeof params[0] === "string"
          ? { data: JSON.parse(params[0]) }
          : { data: params[0] };
      whereValue = params[params.length - 1];
    }

    let query = this.client.from(sqlInfo.tableName).update(updateData);

    if (sqlInfo.hasWhere && whereValue) {
      query = query.eq("id", whereValue);
    }

    if (sqlInfo.hasReturning) {
      query = query.select();
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  async executeDelete<T>(sqlInfo: any, params: any[]): Promise<T[]> {
    let query = this.client.from(sqlInfo.tableName).delete();

    if (sqlInfo.hasWhere && params.length > 0) {
      query = query.eq("id", params[0]);
    }

    if (sqlInfo.hasReturning) {
      query = query.select();
    }

    const { error } = await query;
    if (error) throw error;

    return [];
  }

  // async executeRawSql<T>(sql: string, params: any[]): Promise<T[]> {
  //   console.log("Using exec_sql for raw query");

  //   const processedSql = this.replacePlaceholders(sql, params);

  //   const { data, error } = await this.client.rpc("exec_sql", {
  //     sql: processedSql,
  //   });

  //   if (error) throw error;
  //   return data || [];
  // }

  async executeRawSql<T>(sql: string, params: any[]): Promise<T[]> {
    console.log("Using exec_sql for raw query");

    const processedSql = this.replacePlaceholders(sql, params);
    console.log("Processed SQL:", processedSql);

    const { data, error } = await this.client.rpc("exec_sql", {
      sql: processedSql,
    });

    console.log("Raw SQL response data:", data);
    console.log("Raw SQL response error:", error);

    if (error) throw error;

    console.log("Returning data:", data || []);
    return data || [];
  }

  parseInsertData(sql: string, params: any[]) {
    if (params.length === 1) {
      const param = params[0];
      if (typeof param === "string") {
        try {
          return { data: JSON.parse(param) };
        } catch {
          return { data: param };
        }
      }
      return param;
    }

    return params[0];
  }

  replacePlaceholders(sql: string, params: any[]): string {
    let processedSql = sql;

    params.forEach((param, index) => {
      const placeholder = `$${index + 1}`;
      let value: string;

      if (param === null || param === undefined) {
        value = "NULL";
      } else if (typeof param === "string") {
        value = `'${param.replace(/'/g, "''")}'`;
      } else if (typeof param === "boolean") {
        value = param ? "TRUE" : "FALSE";
      } else if (typeof param === "object") {
        value = `'${JSON.stringify(param)}'::jsonb`;
      } else {
        value = String(param);
      }

      processedSql = processedSql.replace(
        new RegExp(`\\$${index + 1}\\b`, "g"),
        value
      );
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
