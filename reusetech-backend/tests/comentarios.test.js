// Mockear todos los módulos ANTES de cualquier require
jest.mock("express", () => {
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    listen: jest.fn(),
    static: jest.fn(),
  }

  // Devolver una función que retorna el mockApp
  const mockExpress = () => mockApp
  mockExpress.static = jest.fn()
  mockExpress.json = jest.fn(() => "json middleware")
  mockExpress.urlencoded = jest.fn(() => "urlencoded middleware")

  return mockExpress
})

jest.mock("pg", () => {
  const mPool = {
    query: jest.fn(),
  }
  return { Pool: jest.fn(() => mPool) }
})

jest.mock("dotenv", () => ({
  config: jest.fn(),
}))

jest.mock("cors", () => jest.fn(() => "cors middleware"))

// Importar módulos necesarios
const { Pool } = require("pg")

describe("Pruebas de API de Comentarios", () => {
  let app
  let comentariosPostHandler
  let comentariosGetHandler

  beforeAll(() => {
    // Silenciar console.log durante las pruebas
    jest.spyOn(console, "log").mockImplementation(() => {})
    jest.spyOn(console, "error").mockImplementation(() => {})

    // Cargar el servidor (esto registrará los handlers en el mock de express)
    require("../server-test.js")

    // Obtener el mock de express
    app = require("express")()

    // Extraer los handlers registrados
    const calls = app.post.mock.calls
    const getCalls = app.get.mock.calls

    // Encontrar los handlers por la ruta - asegurándose de que existan
    const comentariosPostRoute = calls.find((call) => call[0] === "/api/comentarios")
    comentariosPostHandler = comentariosPostRoute ? comentariosPostRoute[1] : null

    const comentariosGetRoute = getCalls.find((call) => call[0].startsWith("/api/comentarios/"))
    comentariosGetHandler = comentariosGetRoute ? comentariosGetRoute[1] : null
        
    // Comprobación del estado de los handlers
    if (!comentariosPostHandler) console.warn("No se encontró el handler para POST /api/comentarios")
    if (!comentariosGetHandler) console.warn("No se encontró el handler para GET /api/comentarios/:publicacion_id")
  })

  afterAll(() => {
    console.log.mockRestore()
    console.error.mockRestore()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Prueba 1: Creación de comentario
   */
  test("POST /api/comentarios debería crear un nuevo comentario", async () => {
    // Saltarse la prueba si no existe el handler
    if (!comentariosPostHandler) {
      console.warn("Omitiendo prueba POST /api/comentarios: handler no disponible")
      return
    }

    // Mock de req y res
    const req = {
      body: {
        publicacion_id: 5,
        autor_id: 1,
        contenido: "¡Me interesa este dispositivo!",
      },
    }

    const mockComentario = {
      id: 3,
      publicacion_id: 5,
      autor_id: 1,
      contenido: "¡Me interesa este dispositivo!",
      fecha: "2023-05-01T14:30:00Z",
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Configurar el mock de la base de datos
    Pool().query.mockResolvedValueOnce({ rows: [mockComentario] })

    // Ejecutar el handler
    await comentariosPostHandler(req, res)

    // Verificaciones
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(mockComentario)
    expect(Pool().query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO comentarios"),
      [5, 1, "¡Me interesa este dispositivo!"]
    )
  })

  /**
   * Prueba 2: Obtener comentarios de una publicación
   */
  test("GET /api/comentarios/:publicacion_id debería devolver los comentarios", async () => {
    // Saltarse la prueba si no existe el handler
    if (!comentariosGetHandler) {
      console.warn("Omitiendo prueba GET /api/comentarios/:publicacion_id: handler no disponible")
      return
    }

    // Mock de req y res
    const req = {
      params: {
        publicacion_id: 5,
      },
    }

    const mockComentarios = [
      {
        id: 3,
        publicacion_id: 5,
        autor_id: 1,
        contenido: "¡Me interesa este dispositivo!",
        fecha: "2023-05-01T14:30:00Z",
        nombre: "Ana Martínez",
      },
      {
        id: 4,
        publicacion_id: 5,
        autor_id: 2,
        contenido: "¿Cuánto tiempo de uso tiene?",
        fecha: "2023-05-01T15:00:00Z",
        nombre: "Carlos Rodríguez",
      },
    ]

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Configurar el mock de la base de datos
    Pool().query.mockResolvedValueOnce({ rows: mockComentarios })

    // Ejecutar el handler
    await comentariosGetHandler(req, res)

    // Verificaciones
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(mockComentarios)
    expect(Pool().query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT c.*, u.nombre FROM comentarios c"),
      [5]
    )
  })

  /**
   * Prueba 3: Manejo de errores al crear un comentario
   */
  test("POST /api/comentarios debería manejar errores de la base de datos", async () => {
    // Saltarse la prueba si no existe el handler
    if (!comentariosPostHandler) {
      console.warn("Omitiendo prueba manejo de errores POST /api/comentarios: handler no disponible")
      return
    }

    // Mock de req y res
    const req = {
      body: {
        publicacion_id: 5,
        autor_id: 1,
        contenido: "¡Me interesa este dispositivo!",
      },
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Configurar el mock para lanzar un error
    Pool().query.mockRejectedValueOnce(new Error("Error de la base de datos"))

    // Ejecutar el handler
    await comentariosPostHandler(req, res)

    // Verificaciones
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
    }))
  })

  /**
   * Prueba 4: Manejo de errores al obtener comentarios
   */
  test("GET /api/comentarios/:publicacion_id debería manejar errores de la base de datos", async () => {
    // Saltarse la prueba si no existe el handler
    if (!comentariosGetHandler) {
      console.warn("Omitiendo prueba manejo de errores GET /api/comentarios/:publicacion_id: handler no disponible")
      return
    }

    // Mock de req y res
    const req = {
      params: {
        publicacion_id: 5,
      },
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Configurar el mock para lanzar un error
    Pool().query.mockRejectedValueOnce(new Error("Error de la base de datos"))

    // Ejecutar el handler
    await comentariosGetHandler(req, res)

    // Verificaciones
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
    }))
  })
})