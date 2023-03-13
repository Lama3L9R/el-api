export interface ELServerConfig {
    http: ELHttpConfig
    database: ELDatabaseConfig 
    
}

export interface ELHttpConfig {
    listen: string
    port: number
}

export interface ELDatabaseConfig {
    mongodbURL: string
}