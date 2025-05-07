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
  
  jest.mock("bcryptjs", () => ({
    hash: jest.fn(() => Promise.resolve("hashedPassword")),
    compare: jest.fn(),
  }))
  
  jest.mock("multer", () => {
    const multerMock = () => ({
      single: () => "multer middleware",
    })
  
    multerMock.diskStorage = jest.fn(() => ({
      destination: "uploads/",
      filename: jest.fn(),
    }))
  
    return multerMock
  })
  
  jest.mock("dotenv", () => ({
    config: jest.fn(),
  }))
  
  jest.mock("cors", () => jest.fn(() => "cors middleware"))
  
  jest.mock("socket.io", () => {
    const mockOn = jest.fn()
    const mockTo = jest.fn().mockReturnThis()
    const mockEmit = jest.fn()
  
    return {
      Server: jest.fn(() => ({
        on: mockOn,
        to: mockTo,
        emit: mockEmit,
      })),
    }
  })
  
  jest.mock("http", () => {
    return {
      createServer: jest.fn(() => ({
        listen: jest.fn(),
      })),
    }
  })
  
  jest.mock("path", () => ({
    extname: jest.fn(() => ".jpg"),
    join: jest.fn((...args) => args.join("/")),
  }))
  
  jest.mock("fs", () => ({
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn(),
    readFileSync: jest.fn(() => "{}"),
    writeFileSync: jest.fn(),
  }))
  
  // Importar módulos necesarios
  const { Pool } = require("pg")
  
  describe("Pruebas de API de Mensajes y Conversaciones", () => {
    let app
    let mensajesPostHandler
    let mensajesGetHandler
    let conversacionesGetHandler
  
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
  
      // Encontrar los handlers por la ruta
      mensajesPostHandler = calls.find((call) => call[0] === "/api/mensajes")[1]
      mensajesGetHandler = getCalls.find(
        (call) => call[0].startsWith("/api/mensajes/")
      )[1]
      conversacionesGetHandler = getCalls.find(
        (call) => call[0].startsWith("/api/conversaciones/")
      )[1]
    })
  
    afterAll(() => {
      console.log.mockRestore()
      console.error.mockRestore()
    })
  
    beforeEach(() => {
      jest.clearAllMocks()
    })
  
    /**
     * Prueba 1: Envío de mensaje
     */
    test("POST /api/mensajes debería crear un nuevo mensaje", async () => {
      // Mock de req y res
      const req = {
        body: {
          remitente_id: 1,
          destinatario_id: 2,
          publicacion_id: 5,
          contenido: "¿Está disponible el dispositivo?",
        },
      }
  
      const mockMensaje = {
        id: 10,
        remitente_id: 1,
        destinatario_id: 2,
        publicacion_id: 5,
        contenido: "¿Está disponible el dispositivo?",
        fecha_envio: "2023-05-01T12:00:00Z",
      }
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      }
  
      // Configurar el mock de la base de datos
      Pool().query.mockResolvedValueOnce({ rows: [mockMensaje] })
  
      // Ejecutar el handler
      await mensajesPostHandler(req, res)
  
      // Verificaciones
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockMensaje)
      expect(Pool().query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO mensajes"),
        [1, 2, 5, "¿Está disponible el dispositivo?"]
      )
    })
  
    /**
     * Prueba 2: Obtener mensajes entre usuarios para una publicación
     */
    test("GET /api/mensajes/:publicacion_id/:user1/:user2 debería devolver los mensajes", async () => {
      // Mock de req y res
      const req = {
        params: {
          publicacion_id: 5,
          user1: 1,
          user2: 2,
        },
      }
  
      const mockMensajes = [
        {
          id: 10,
          remitente_id: 1,
          destinatario_id: 2,
          publicacion_id: 5,
          contenido: "¿Está disponible el dispositivo?",
          fecha_envio: "2023-05-01T12:00:00Z",
        },
        {
          id: 11,
          remitente_id: 2,
          destinatario_id: 1,
          publicacion_id: 5,
          contenido: "Sí, está disponible",
          fecha_envio: "2023-05-01T12:05:00Z",
        },
      ]
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      }
  
      // Configurar el mock de la base de datos
      Pool().query.mockResolvedValueOnce({ rows: mockMensajes })
  
      // Ejecutar el handler
      await mensajesGetHandler(req, res)
  
      // Verificaciones
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockMensajes)
      expect(Pool().query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM mensajes"),
        [5, 1, 2]
      )
    })
  
    /**
     * Prueba 3: Obtener todas las conversaciones de un usuario
     */
    test("GET /api/conversaciones/:userId debería devolver las conversaciones del usuario", async () => {
      // Mock de req y res
      const req = {
        params: {
          userId: 1,
        },
      }
  
      const mockConversaciones = [
        {
          id: 10,
          publicacion_id: 5,
          remitente_id: 1,
          destinatario_id: 2,
          contenido: "¿Está disponible el dispositivo?",
          fecha_envio: "2023-05-01T12:00:00Z",
          usuario_nombre: "María García",
          publicacion_titulo: "iPhone 12 Pro Max",
        },
        {
          id: 15,
          publicacion_id: 7,
          remitente_id: 3,
          destinatario_id: 1,
          contenido: "¿Cuánto tiempo de uso tiene?",
          fecha_envio: "2023-05-02T10:30:00Z",
          usuario_nombre: "Pedro López",
          publicacion_titulo: "MacBook Pro 2021",
        },
      ]
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      }
  
      // Configurar el mock de la base de datos
      Pool().query.mockResolvedValueOnce({ rows: mockConversaciones })
  
      // Ejecutar el handler
      await conversacionesGetHandler(req, res)
  
      // Verificaciones
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockConversaciones)
      expect(Pool().query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT DISTINCT ON"),
        [1]
      )
    })
  
    /**
     * Prueba 4: Manejo de errores al enviar mensajes
     */
    test("POST /api/mensajes debería manejar errores de base de datos", async () => {
      // Mock de req y res
      const req = {
        body: {
          remitente_id: 1,
          destinatario_id: 2,
          publicacion_id: 5,
          contenido: "¿Está disponible el dispositivo?",
        },
      }
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      }
  
      // Configurar el mock para lanzar un error
      Pool().query.mockRejectedValueOnce(new Error("Error de base de datos"))
  
      // Ejecutar el handler
      await mensajesPostHandler(req, res)
  
      // Verificaciones
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al enviar mensaje",
      })
    })
  })