// Importa funciones de validación desde express-validator
// validationResult: extrae los errores del request
// matchedData: obtiene únicamente los datos que pasaron las validaciones
import { validationResult, matchedData } from "express-validator";

// Importa el módulo personalizado de conexión a la base de datos
import DB from "./database.js";

// Configuración personalizada para formatear errores de validación
// withDefaults permite cambiar el formato de salida
// formatter retorna solo el mensaje del error
const validation_result = validationResult.withDefaults({
    formatter: (error) => {
        return error.msg;
    }
});

// Clase Controller que contiene toda la lógica del negocio (PELÍCULAS)
class Controller {

    // ==========================
    // MIDDLEWARE DE VALIDACIÓN
    // ==========================
    // Se ejecuta antes del controlador principal
    // Verifica si existen errores de validación
    static validation = (req, res, next) => {

        // Extrae los errores del request
        const errors = validation_result(req).mapped();

        // Si existen errores, se envía respuesta con código 422
        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                ok: 0,
                status: 422,
                errors,
            });
        }

        // Si no hay errores, continúa al siguiente middleware
        next();
    };

    // ==========================
    // CREAR UNA NUEVA PELÍCULA
    // ==========================
    static create = async (req, res, next) => {

        // Obtiene únicamente los datos validados
        const { titulo, año, critica, caratula } = matchedData(req);

        try {
            // Inserta una nueva película en la base de datos
            const [result] = await DB.execute(
                "INSERT INTO peliculas (titulo, año, critica, caratula) VALUES (?, ?, ?, ?)",
                [titulo, año, critica, caratula || null]
            );

            // Respuesta exitosa (201 Created)
            res.status(201).json({
                ok: 1,
                status: 201,
                message: "película creada de manera exitosa",
                id_pelicula: result.insertId,
            });

        } catch (e) {
            next(e);
        }
    };

    // ==========================
    // OBTENER PELÍCULAS (UNA O TODAS)
    // ==========================
    static show_movies = async (req, res, next) => {

        try {
            // Consulta por defecto: obtener todas las películas
            let sql = "SELECT * FROM peliculas";

            // Si se envía un ID por parámetro
            if (req.params.id) {
                sql = "SELECT * FROM peliculas WHERE id_pelicula = ?";
            }

            // Ejecuta la consulta
            const [row] = await DB.query(
                sql,
                req.params.id ? [req.params.id] : []
            );

            // Si se busca por ID y no existe
            if (row.length === 0 && req.params.id) {
                return res.status(404).json({
                    ok: 0,
                    status: 404,
                    message: "ID de película inválido",
                });
            }

            // Estructura dinámica de respuesta
            const pelicula = req.params.id
                ? { pelicula: row[0] }
                : { peliculas: row };

            // Respuesta exitosa
            res.status(200).json({
                ok: 1,
                status: 200,
                ...pelicula,
            });

        } catch (e) {
            next(e);
        }
    };

    // ==========================
    // EDITAR UNA PELÍCULA
    // ==========================
    static edit_movie = async (req, res, next) => {

        try {
            // Extrae solo los datos validados
            const data = matchedData(req);

            // Verifica que la película exista
            const [row] = await DB.query(
                "SELECT * FROM peliculas WHERE id_pelicula = ?",
                [data.id_pelicula]
            );

            if (row.length !== 1) {
                return res.status(404).json({
                    ok: 0,
                    status: 404,
                    message: "ID de película inválido",
                });
            }

            const pelicula = row[0];

            // Mantiene valores antiguos si no vienen nuevos
            const titulo = data.titulo || pelicula.titulo;
            const año = data.año || pelicula.año;
            const critica = data.critica || pelicula.critica;
            const caratula = data.caratula || pelicula.caratula;

            // Actualiza la película
            await DB.execute(
                "UPDATE peliculas SET titulo=?, año=?, critica=?, caratula=? WHERE id_pelicula=?",
                [titulo, año, critica, caratula, data.id_pelicula]
            );

            res.json({
                ok: 1,
                status: 200,
                message: "película actualizada de manera exitosa",
            });

        } catch (e) {
            next(e);
        }
    };

    // ==========================
    // ELIMINAR UNA PELÍCULA
    // ==========================
    static delete_movie = async (req, res, next) => {

        try {
            const [result] = await DB.execute(
                "DELETE FROM peliculas WHERE id_pelicula = ?",
                [req.body.id_pelicula]
            );

            if (result.affectedRows > 0) {
                return res.json({
                    ok: 1,
                    status: 200,
                    message: "película eliminada de manera exitosa",
                });
            }

            return res.status(404).json({
                ok: 0,
                status: 404,
                message: "ID de película inválido",
            });

        } catch (e) {
            next(e);
        }
    };
}

// Exporta el controller
export default Controller;
