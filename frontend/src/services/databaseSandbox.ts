// Database sandbox system for backend API challenges
export type DatabaseType = 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';

export interface DatabaseConfig {
  type: DatabaseType;
  name: string;
  seedData: SeedData[];
  schema?: SchemaDefinition[];
  constraints?: ConstraintDefinition[];
}

export interface SeedData {
  table: string;
  data: Record<string, any>[];
}

export interface SchemaDefinition {
  table: string;
  columns: ColumnDefinition[];
  indexes?: IndexDefinition[];
}

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable?: boolean;
  primaryKey?: boolean;
  unique?: boolean;
  defaultValue?: any;
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
}

export interface ConstraintDefinition {
  name: string;
  type: 'foreign_key' | 'check' | 'unique';
  table: string;
  columns: string[];
  references?: {
    table: string;
    columns: string[];
  };
  condition?: string;
}

export interface QueryResult {
  rows: Record<string, any>[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

export interface DatabaseConnection {
  id: string;
  type: DatabaseType;
  status: 'connected' | 'disconnected' | 'error';
  lastActivity: Date;
}

// In-memory database implementation for sandboxing
class InMemoryDatabase {
  private tables: Map<string, Record<string, any>[]> = new Map();
  private schema: Map<string, SchemaDefinition> = new Map();
  private constraints: ConstraintDefinition[] = [];
  private autoIncrementCounters: Map<string, number> = new Map();

  constructor(private config: DatabaseConfig) {
    this.initializeSchema();
    this.seedDatabase();
  }

  private initializeSchema(): void {
    if (this.config.schema) {
      for (const schemaDef of this.config.schema) {
        this.schema.set(schemaDef.table, schemaDef);
        this.tables.set(schemaDef.table, []);
        
        // Initialize auto-increment counters
        const autoIncrementColumn = schemaDef.columns.find(col => 
          col.type.toLowerCase().includes('auto_increment') || 
          col.type.toLowerCase().includes('serial')
        );
        
        if (autoIncrementColumn) {
          this.autoIncrementCounters.set(schemaDef.table, 1);
        }
      }
    }

    if (this.config.constraints) {
      this.constraints = [...this.config.constraints];
    }
  }

  private seedDatabase(): void {
    for (const seed of this.config.seedData) {
      if (!this.tables.has(seed.table)) {
        this.tables.set(seed.table, []);
      }
      
      const table = this.tables.get(seed.table)!;
      for (const row of seed.data) {
        table.push({ ...row });
      }
    }
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    const startTime = performance.now();
    
    try {
      const normalizedSQL = sql.trim().toLowerCase();
      
      if (normalizedSQL.startsWith('select')) {
        return this.executeSelect(sql);
      } else if (normalizedSQL.startsWith('insert')) {
        return this.executeInsert(sql);
      } else if (normalizedSQL.startsWith('update')) {
        return this.executeUpdate(sql);
      } else if (normalizedSQL.startsWith('delete')) {
        return this.executeDelete(sql);
      } else if (normalizedSQL.startsWith('create')) {
        return this.executeCreate(sql);
      } else if (normalizedSQL.startsWith('drop')) {
        return this.executeDrop(sql);
      } else {
        throw new Error(`Unsupported SQL operation: ${sql.split(' ')[0]}`);
      }
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        rows: [],
        rowCount: 0,
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private executeSelect(sql: string): QueryResult {
    const startTime = performance.now();
    
    // Simple SQL parser for SELECT statements
    const selectMatch = sql.match(/select\s+(.*?)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+order\s+by\s+(.+?))?(?:\s+limit\s+(\d+))?/i);
    
    if (!selectMatch) {
      throw new Error('Invalid SELECT syntax');
    }

    const [, columns, tableName, whereClause, orderBy, limit] = selectMatch;
    
    if (!this.tables.has(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }

    let rows = [...this.tables.get(tableName)!];

    // Apply WHERE clause
    if (whereClause) {
      rows = this.applyWhereClause(rows, whereClause);
    }

    // Apply ORDER BY
    if (orderBy) {
      rows = this.applyOrderBy(rows, orderBy);
    }

    // Apply LIMIT
    if (limit) {
      rows = rows.slice(0, parseInt(limit));
    }

    // Select specific columns
    if (columns.trim() !== '*') {
      const selectedColumns = columns.split(',').map(col => col.trim());
      rows = rows.map(row => {
        const newRow: Record<string, any> = {};
        for (const col of selectedColumns) {
          if (row.hasOwnProperty(col)) {
            newRow[col] = row[col];
          }
        }
        return newRow;
      });
    }

    const executionTime = performance.now() - startTime;
    
    return {
      rows,
      rowCount: rows.length,
      executionTime
    };
  }

  private executeInsert(sql: string): QueryResult {
    const startTime = performance.now();
    
    // Parse INSERT statement
    const insertMatch = sql.match(/insert\s+into\s+(\w+)\s*\(([^)]+)\)\s*values\s*\(([^)]+)\)/i);
    
    if (!insertMatch) {
      throw new Error('Invalid INSERT syntax');
    }

    const [, tableName, columnsList, valuesList] = insertMatch;
    
    if (!this.tables.has(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }

    const columns = columnsList.split(',').map(col => col.trim());
    const values = this.parseValues(valuesList);

    if (columns.length !== values.length) {
      throw new Error('Column count does not match value count');
    }

    const newRow: Record<string, any> = {};
    
    // Handle auto-increment columns
    const tableSchema = this.schema.get(tableName);
    if (tableSchema) {
      for (const columnDef of tableSchema.columns) {
        if (columnDef.type.toLowerCase().includes('auto_increment') || 
            columnDef.type.toLowerCase().includes('serial')) {
          const counter = this.autoIncrementCounters.get(tableName) || 1;
          newRow[columnDef.name] = counter;
          this.autoIncrementCounters.set(tableName, counter + 1);
        }
      }
    }

    // Set provided values
    for (let i = 0; i < columns.length; i++) {
      newRow[columns[i]] = values[i];
    }

    // Validate constraints
    this.validateConstraints(tableName, newRow, 'insert');

    this.tables.get(tableName)!.push(newRow);

    const executionTime = performance.now() - startTime;
    
    return {
      rows: [newRow],
      rowCount: 1,
      executionTime
    };
  }

  private executeUpdate(sql: string): QueryResult {
    const startTime = performance.now();
    
    const updateMatch = sql.match(/update\s+(\w+)\s+set\s+(.+?)(?:\s+where\s+(.+))?/i);
    
    if (!updateMatch) {
      throw new Error('Invalid UPDATE syntax');
    }

    const [, tableName, setClause, whereClause] = updateMatch;
    
    if (!this.tables.has(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }

    const rows = this.tables.get(tableName)!;
    let updatedCount = 0;

    // Parse SET clause
    const updates = this.parseSetClause(setClause);

    for (const row of rows) {
      if (!whereClause || this.evaluateWhereCondition(row, whereClause)) {
        // Apply updates
        for (const [column, value] of Object.entries(updates)) {
          row[column] = value;
        }
        
        // Validate constraints
        this.validateConstraints(tableName, row, 'update');
        updatedCount++;
      }
    }

    const executionTime = performance.now() - startTime;
    
    return {
      rows: [],
      rowCount: updatedCount,
      executionTime
    };
  }

  private executeDelete(sql: string): QueryResult {
    const startTime = performance.now();
    
    const deleteMatch = sql.match(/delete\s+from\s+(\w+)(?:\s+where\s+(.+))?/i);
    
    if (!deleteMatch) {
      throw new Error('Invalid DELETE syntax');
    }

    const [, tableName, whereClause] = deleteMatch;
    
    if (!this.tables.has(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }

    const rows = this.tables.get(tableName)!;
    const originalLength = rows.length;

    if (whereClause) {
      // Remove rows that match the WHERE clause
      for (let i = rows.length - 1; i >= 0; i--) {
        if (this.evaluateWhereCondition(rows[i], whereClause)) {
          rows.splice(i, 1);
        }
      }
    } else {
      // Delete all rows
      rows.length = 0;
    }

    const deletedCount = originalLength - rows.length;
    const executionTime = performance.now() - startTime;
    
    return {
      rows: [],
      rowCount: deletedCount,
      executionTime
    };
  }

  private executeCreate(sql: string): QueryResult {
    const startTime = performance.now();
    
    const createMatch = sql.match(/create\s+table\s+(\w+)\s*\(([^)]+)\)/i);
    
    if (!createMatch) {
      throw new Error('Invalid CREATE TABLE syntax');
    }

    const [, tableName, columnDefs] = createMatch;
    
    if (this.tables.has(tableName)) {
      throw new Error(`Table '${tableName}' already exists`);
    }

    // Parse column definitions
    const columns = this.parseColumnDefinitions(columnDefs);
    
    const schemaDef: SchemaDefinition = {
      table: tableName,
      columns
    };

    this.schema.set(tableName, schemaDef);
    this.tables.set(tableName, []);

    const executionTime = performance.now() - startTime;
    
    return {
      rows: [],
      rowCount: 0,
      executionTime
    };
  }

  private executeDrop(sql: string): QueryResult {
    const startTime = performance.now();
    
    const dropMatch = sql.match(/drop\s+table\s+(\w+)/i);
    
    if (!dropMatch) {
      throw new Error('Invalid DROP TABLE syntax');
    }

    const [, tableName] = dropMatch;
    
    if (!this.tables.has(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }

    this.tables.delete(tableName);
    this.schema.delete(tableName);
    this.autoIncrementCounters.delete(tableName);

    const executionTime = performance.now() - startTime;
    
    return {
      rows: [],
      rowCount: 0,
      executionTime
    };
  }

  private applyWhereClause(rows: Record<string, any>[], whereClause: string): Record<string, any>[] {
    return rows.filter(row => this.evaluateWhereCondition(row, whereClause));
  }

  private evaluateWhereCondition(row: Record<string, any>, condition: string): boolean {
    // Simple condition evaluation (supports basic operators)
    const conditionMatch = condition.match(/(\w+)\s*(=|!=|<|>|<=|>=)\s*(.+)/);
    
    if (!conditionMatch) {
      return true; // If we can't parse the condition, include the row
    }

    const [, column, operator, valueStr] = conditionMatch;
    const value = this.parseValue(valueStr.trim());
    const rowValue = row[column];

    switch (operator) {
      case '=':
        return rowValue == value;
      case '!=':
        return rowValue != value;
      case '<':
        return rowValue < value;
      case '>':
        return rowValue > value;
      case '<=':
        return rowValue <= value;
      case '>=':
        return rowValue >= value;
      default:
        return true;
    }
  }

  private applyOrderBy(rows: Record<string, any>[], orderBy: string): Record<string, any>[] {
    const orderMatch = orderBy.match(/(\w+)(?:\s+(asc|desc))?/i);
    
    if (!orderMatch) {
      return rows;
    }

    const [, column, direction] = orderMatch;
    const isDesc = direction?.toLowerCase() === 'desc';

    return rows.sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      
      if (aVal < bVal) return isDesc ? 1 : -1;
      if (aVal > bVal) return isDesc ? -1 : 1;
      return 0;
    });
  }

  private parseValues(valuesList: string): any[] {
    return valuesList.split(',').map(val => this.parseValue(val.trim()));
  }

  private parseValue(value: string): any {
    // Remove quotes and parse value
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
    
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    
    if (value.toLowerCase() === 'null') {
      return null;
    }
    
    if (value.toLowerCase() === 'true') {
      return true;
    }
    
    if (value.toLowerCase() === 'false') {
      return false;
    }
    
    // Try to parse as number
    const num = Number(value);
    if (!isNaN(num)) {
      return num;
    }
    
    return value;
  }

  private parseSetClause(setClause: string): Record<string, any> {
    const updates: Record<string, any> = {};
    const assignments = setClause.split(',');
    
    for (const assignment of assignments) {
      const [column, value] = assignment.split('=').map(s => s.trim());
      updates[column] = this.parseValue(value);
    }
    
    return updates;
  }

  private parseColumnDefinitions(columnDefs: string): ColumnDefinition[] {
    const columns: ColumnDefinition[] = [];
    const defs = columnDefs.split(',');
    
    for (const def of defs) {
      const parts = def.trim().split(/\s+/);
      const name = parts[0];
      const type = parts[1] || 'TEXT';
      
      const column: ColumnDefinition = {
        name,
        type,
        nullable: !def.toLowerCase().includes('not null'),
        primaryKey: def.toLowerCase().includes('primary key'),
        unique: def.toLowerCase().includes('unique')
      };
      
      columns.push(column);
    }
    
    return columns;
  }

  private validateConstraints(tableName: string, row: Record<string, any>, operation: 'insert' | 'update'): void {
    // Validate schema constraints
    const tableSchema = this.schema.get(tableName);
    if (tableSchema) {
      for (const column of tableSchema.columns) {
        const value = row[column.name];
        
        // Check NOT NULL constraints
        if (!column.nullable && (value === null || value === undefined)) {
          throw new Error(`Column '${column.name}' cannot be null`);
        }
        
        // Check UNIQUE constraints
        if (column.unique && value !== null) {
          const table = this.tables.get(tableName)!;
          const duplicates = table.filter(r => r !== row && r[column.name] === value);
          if (duplicates.length > 0) {
            throw new Error(`Duplicate value '${value}' for unique column '${column.name}'`);
          }
        }
      }
    }

    // Validate custom constraints
    for (const constraint of this.constraints) {
      if (constraint.table === tableName) {
        this.validateCustomConstraint(constraint, row, tableName);
      }
    }
  }

  private validateCustomConstraint(constraint: ConstraintDefinition, row: Record<string, any>, tableName: string): void {
    switch (constraint.type) {
      case 'foreign_key':
        if (constraint.references) {
          const foreignTable = this.tables.get(constraint.references.table);
          if (foreignTable) {
            const foreignKey = row[constraint.columns[0]];
            if (foreignKey !== null) {
              const exists = foreignTable.some(r => r[constraint.references!.columns[0]] === foreignKey);
              if (!exists) {
                throw new Error(`Foreign key constraint violation: ${constraint.name}`);
              }
            }
          }
        }
        break;
        
      case 'check':
        if (constraint.condition) {
          if (!this.evaluateWhereCondition(row, constraint.condition)) {
            throw new Error(`Check constraint violation: ${constraint.name}`);
          }
        }
        break;
        
      case 'unique':
        const table = this.tables.get(tableName)!;
        const values = constraint.columns.map(col => row[col]);
        const duplicates = table.filter(r => {
          if (r === row) return false;
          return constraint.columns.every((col, i) => r[col] === values[i]);
        });
        if (duplicates.length > 0) {
          throw new Error(`Unique constraint violation: ${constraint.name}`);
        }
        break;
    }
  }

  getTables(): string[] {
    return Array.from(this.tables.keys());
  }

  getTableSchema(tableName: string): SchemaDefinition | undefined {
    return this.schema.get(tableName);
  }

  getTableData(tableName: string): Record<string, any>[] {
    return this.tables.get(tableName) || [];
  }

  reset(): void {
    this.tables.clear();
    this.schema.clear();
    this.constraints = [];
    this.autoIncrementCounters.clear();
    this.initializeSchema();
    this.seedDatabase();
  }
}

// Database sandbox manager
export class DatabaseSandbox {
  private databases: Map<string, InMemoryDatabase> = new Map();
  private connections: Map<string, DatabaseConnection> = new Map();

  createDatabase(challengeId: string, config: DatabaseConfig): string {
    const dbId = `${challengeId}_${Date.now()}`;
    const database = new InMemoryDatabase(config);
    
    this.databases.set(dbId, database);
    this.connections.set(dbId, {
      id: dbId,
      type: config.type,
      status: 'connected',
      lastActivity: new Date()
    });

    return dbId;
  }

  async executeQuery(dbId: string, sql: string): Promise<QueryResult> {
    const database = this.databases.get(dbId);
    if (!database) {
      throw new Error(`Database ${dbId} not found`);
    }

    // Update last activity
    const connection = this.connections.get(dbId);
    if (connection) {
      connection.lastActivity = new Date();
    }

    return await database.executeQuery(sql);
  }

  getDatabaseInfo(dbId: string): {
    tables: string[];
    schemas: Record<string, SchemaDefinition>;
    connection: DatabaseConnection | undefined;
  } {
    const database = this.databases.get(dbId);
    const connection = this.connections.get(dbId);
    
    if (!database) {
      throw new Error(`Database ${dbId} not found`);
    }

    const tables = database.getTables();
    const schemas: Record<string, SchemaDefinition> = {};
    
    for (const table of tables) {
      const schema = database.getTableSchema(table);
      if (schema) {
        schemas[table] = schema;
      }
    }

    return { tables, schemas, connection };
  }

  resetDatabase(dbId: string): void {
    const database = this.databases.get(dbId);
    if (database) {
      database.reset();
    }
  }

  closeDatabase(dbId: string): void {
    this.databases.delete(dbId);
    const connection = this.connections.get(dbId);
    if (connection) {
      connection.status = 'disconnected';
    }
  }

  cleanup(): void {
    // Clean up old databases (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [dbId, connection] of this.connections) {
      if (connection.lastActivity < oneHourAgo) {
        this.closeDatabase(dbId);
        this.connections.delete(dbId);
      }
    }
  }

  getActiveConnections(): DatabaseConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.status === 'connected');
  }
}

// Global database sandbox instance
export const databaseSandbox = new DatabaseSandbox();

// Cleanup interval
setInterval(() => {
  databaseSandbox.cleanup();
}, 10 * 60 * 1000); // Every 10 minutes