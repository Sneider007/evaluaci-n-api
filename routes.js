// Importa la clase Router desde Express para crear rutas modulares
import { Router } from "express";

// Importa funciones de validación de express-validator
// body  → valida datos enviados en el cuerpo (req.body)
// param → valida parámetros enviados por la URL (req.params)
import { body, param } from "express-validator";

// Importa el controlador de películas
import controller from "./controller.js";

// Crea una nueva instancia del Router
// strict: true → las rutas deben coincidir exactamente
const routes = Router({ strict: true });

// ======================================================
// RUTA POST → CREAR UNA NUEVA PELÍCULA
// Endpoint: POST /create
// ======================================================
routes.post(
    "/create",
    [
        // Validación del campo "titulo"
        body("titulo", "El título no puede estar vacío")
            .trim()
            .not()
            .isEmpty()
            .escape(),

        // Validación del campo "año"
        body("año", "El año debe ser un número válido")
            .isInt({ min: 1800, max: 2100 })
            .toInt(),

        // Validación del campo "critica"
        body("critica", "La crítica no puede estar vacía")
            .trim()
            .not()
            .isEmpty()
            .escape(),

        // Validación del campo "caratula" (opcional)
        body("caratula")
            .optional()
            .trim()
            .escape(),
    ],
    // Middleware de validación
    controller.validation,
    // Controlador que crea la película
    controller.create
);

// ======================================================
// RUTA GET → OBTENER TODAS LAS PELÍCULAS
// Endpoint: GET /peliculas
// ======================================================
routes.get(
    "/peliculas",
    controller.show_movies
);

// ======================================================
// RUTA GET → OBTENER UNA PELÍCULA POR ID
// Endpoint: GET /pelicula/:id
// ======================================================
routes.get(
    "/pelicula/:id",
    [
        // Validación del ID de la película
        param("id", "ID de película inválido")
            .exists()
            .isNumeric()
            .toInt(),
    ],
    controller.validation,
    controller.show_movies
);

// ======================================================
// RUTA PUT → EDITAR UNA PELÍCULA
// Endpoint: PUT /edit
// ======================================================
routes.put(
    "/edit",
    [
        // ID de la película
        body("id_pelicula", "ID de película inválido")
            .isNumeric()
            .toInt(),

        // Campo "titulo" (opcional)
        body("titulo", "El título no puede estar vacío")
            .optional()
            .trim()
            .not()
            .isEmpty()
            .escape(),

        // Campo "año" (opcional)
        body("año", "El año debe ser válido")
            .optional()
            .isInt({ min: 1800, max: 2100 })
            .toInt(),

        // Campo "critica" (opcional)
        body("critica", "La crítica no puede estar vacía")
            .optional()
            .trim()
            .not()
            .isEmpty()
            .escape(),

        // Campo "caratula" (opcional)
        body("caratula")
            .optional()
            .trim()
            .escape(),
    ],
    controller.validation,
    controller.edit_movie
);

// ======================================================
// RUTA DELETE → ELIMINAR UNA PELÍCULA
// Endpoint: DELETE /delete
// ======================================================
routes.delete(
    "/delete",
    [
        // Validación del ID de la película
        body("id_pelicula", "ID de película inválido")
            .isNumeric()
            .toInt(),
    ],
    controller.validation,
    controller.delete_movie
);

// Exporta las rutas
export default routes;
