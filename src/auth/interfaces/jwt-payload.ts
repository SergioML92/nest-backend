
export interface JwtPayload {
    id: string,
    // Fecha de creación
    iat?: number;
    // Fecha de expiración
    exp?: number;
}