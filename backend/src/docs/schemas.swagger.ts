/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         foto_perfil:
 *           type: string
 *           nullable: true
 *         zona_localidad:
 *           type: string
 *           nullable: true
 *         zona_ciudad:
 *           type: string
 *           nullable: true
 *         zona_estado:
 *           type: string
 *           nullable: true
 *         zona_pais:
 *           type: string
 *           nullable: true
 *         rango:
 *           type: string
 *           example: "D"
 *         victorias:
 *           type: integer
 *           default: 0
 *         derrotas:
 *           type: integer
 *           default: 0
 *         retos_consecutivos:
 *           type: integer
 *           default: 0
 *         estado:
 *           type: string
 *           example: "activo"
 *         rol:
 *           type: string
 *           example: "piloto"
 *         created_at:
 *           type: string
 *           format: date-time
 *     Vehicle:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         tipo_vehiculo:
 *           type: string
 *         marca:
 *           type: string
 *           nullable: true
 *         modelo:
 *           type: string
 *           nullable: true
 *         año:
 *           type: integer
 *           nullable: true
 *         color:
 *           type: string
 *           nullable: true
 *         placa:
 *           type: string
 *           nullable: true
 *         foto:
 *           type: string
 *           nullable: true
 *         modificaciones:
 *           type: string
 *           nullable: true
 *         activo:
 *           type: boolean
 *           default: false
 *     Challenge:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         retador_id:
 *           type: string
 *           format: uuid
 *         retado_id:
 *           type: string
 *           format: uuid
 *         vehiculo_retador_id:
 *           type: string
 *           format: uuid
 *         vehiculo_retado_id:
 *           type: string
 *           format: uuid
 *         tipo_carrera:
 *           type: string
 *         estado:
 *           type: string
 *           example: "pendiente"
 *         ganador_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         ubicacion_acordada:
 *           type: string
 *           nullable: true
 *         fecha_acordada:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         notas:
 *           type: string
 *           nullable: true
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *           nullable: true
 *         activo:
 *           type: boolean
 *           default: true
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         tipo:
 *           type: string
 *         mensaje:
 *           type: string
 *         leida:
 *           type: boolean
 *           default: false
 *         referencia_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *   responses:
 *     Unauthorized:
 *       description: Token inválido o no proporcionado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Token inválido"
 *     InternalError:
 *       description: Error interno del servidor
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Error interno del servidor"
 */
