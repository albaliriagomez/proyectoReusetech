// Archivo para probar la API desde el navegador
// Puedes ejecutar este código en la consola del navegador para verificar si la API está funcionando

async function testAPI() {
    try {
      console.log("Probando conexión a la API...")
  
      // Probar endpoint de test
      const testResponse = await fetch("/api/test")
      const testData = await testResponse.json()
      console.log("Respuesta de /api/test:", testData)
  
      // Probar endpoint de diagnóstico
      const diagnosticoTestResponse = await fetch("/api/diagnostico/test")
      const diagnosticoTestData = await diagnosticoTestResponse.json()
      console.log("Respuesta de /api/diagnostico/test:", diagnosticoTestData)
  
      console.log("Pruebas completadas con éxito")
    } catch (error) {
      console.error("Error al probar la API:", error)
    }
  }
  
  // Para ejecutar la prueba, escribe en la consola del navegador:
  // testAPI()
  