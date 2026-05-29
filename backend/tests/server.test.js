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

jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: jest.fn(() => ({
        generateContent: jest.fn(() =>
          Promise.resolve({
            response: {
              text: jest.fn(() => Promise.resolve("Respuesta de prueba de la IA")),
            },
          }),
        ),
      })),
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

// Ahora podemos importar nuestros módulos
const { Pool } = require("pg")
const bcrypt = require("bcryptjs")

describe("API Tests Unitarios", () => {
  let app
  let registerHandler
  let loginHandler
  let publicacionesGetHandler
  //let comentariosPostHandler

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
    registerHandler = calls.find((call) => call[0] === "/api/register")[1]
    loginHandler = calls.find((call) => call[0] === "/api/login")[1]
    publicacionesGetHandler = getCalls.find((call) => call[0] === "/api/publicaciones")[1]
    //comentariosPostHandler = calls.find((call) => call[0] === "/api/comentarios")[1];
})

  afterAll(() => {
    console.log.mockRestore()
    console.error.mockRestore()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * Prueba 1: Registro de usuario
   */
  test("POST /api/register debería registrar un nuevo usuario", async () => {
    // Mock de req y res
    const req = {
      body: {
        nombre: "Test",
        apellidos: "User",
        email: "test@example.com",
        password: "password123",
        rol: "usuario",
      },
    }

    const mockUser = {
      id: 1,
      nombre: "Test",
      apellidos: "User",
      email: "test@example.com",
      rol: "usuario",
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Configurar el mock de la base de datos
    Pool().query.mockResolvedValueOnce({ rows: [mockUser] })

    // Ejecutar el handler
    await registerHandler(req, res)

    // Verificaciones
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(mockUser)
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10)
    expect(Pool().query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO usuarios"), [
      "Test",
      "User",
      "test@example.com",
      "hashedPassword",
      "usuario",
    ])
  })

  /**
   * Prueba 2: Login de usuario
   */
  test("POST /api/login debería autenticar a un usuario", async () => {
    // Mock de req y res
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    }

    const mockUser = {
      id: 1,
      nombre: "Test",
      apellidos: "User",
      email: "test@example.com",
      password: "hashedPassword",
      rol: "usuario",
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Configurar los mocks
    Pool().query.mockResolvedValueOnce({ rows: [mockUser] })
    bcrypt.compare.mockResolvedValueOnce(true)

    // Ejecutar el handler
    await loginHandler(req, res)

    // Verificaciones
    expect(res.json).toHaveBeenCalledWith({ success: true, user: mockUser })
    expect(Pool().query).toHaveBeenCalledWith("SELECT * FROM usuarios WHERE email = $1", ["test@example.com"])
    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword")
  })

  /**
   * Prueba 3: Obtener publicaciones con filtros
   */
  test("GET /api/publicaciones debería devolver publicaciones filtradas", async () => {
    // Mock de req y res
    const req = {
      query: {
        page: 1,
        limit: 10,
        categoria: "Móvil",
        estado: "Nuevo",
      },
    }

    const mockPublicaciones = [
      { id: 1, titulo: "Dispositivo 1", categoria: "Móvil", estado: "Nuevo" },
      { id: 2, titulo: "Dispositivo 2", categoria: "Tablet", estado: "Usado" },
    ]

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Configurar el mock de la base de datos
    Pool().query.mockResolvedValueOnce({ rows: mockPublicaciones })

    // Ejecutar el handler
    await publicacionesGetHandler(req, res)

    // Verificaciones
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(mockPublicaciones)
  })
})
