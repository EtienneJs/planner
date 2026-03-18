type ResponseOptions = {
    message: string;
    status: number;
    data?: unknown;
    details?: unknown;
  };
  
  export const responseApi = ({
    message,
    status,
    data,
    details,
  }: ResponseOptions): Response => {
    const body: Record<string, unknown> = { message };
    if (data !== undefined) body.data = data;
    if (details !== undefined) body.details = details;
  
    return Response.json(body, { status });
  };
  
  // Atajos opcionales
  export const api = {
    ok: (message: string, data?: unknown) =>
      responseApi({ message, status: 200, data }),
    created: (message: string, data?: unknown) =>
      responseApi({ message, status: 201, data }),
    badRequest: (message: string, details?: unknown) =>
      responseApi({ message, status: 400, details }),
    unauthorized: (message = "No autorizado") =>
      responseApi({ message, status: 401 }),
    notFound: (message = "No encontrado") =>
      responseApi({ message, status: 404 }),
    serverError: (message = "Error interno") =>
      responseApi({ message, status: 500 }),
  };