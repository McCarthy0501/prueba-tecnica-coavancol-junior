import { useState, useEffect } from "react";

// Definición de la Interfaz (Estructura de la data)
interface Usuario {
    id: number;
    estado_pipeline: string;
    Nombre: string;
    Identificación: number;
}

// Lista fija de opciones para el filtro select
const OPCIONES_FILTRO = [
    'Todos',
    'Prospecto',
    'Expediente en Construcción',
    'Pendiente Jurídico',
    'Pendiente Cierre de Crédito'
];

export const AsociadosList = () => {
    // 1. Estados
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    // Estado para saber si la data está cargando
    const [isLoading, setIsLoading] = useState<boolean>(true); 
    // Estado para el filtro seleccionado, inicializado en 'Todos'
    const [filtroPipeline, setFiltroPipeline] = useState<string>('Todos'); 
    // Estado para manejar posibles errores de la petición
    const [error, setError] = useState<string | null>(null);

    // 2. useEffect para la carga de datos y manejo de errores
    useEffect(() => {
        const solicitud = async () => {
            setIsLoading(true); // Inicia la carga
            setError(null);    // Limpia errores previos
            try {
                const url = "https://raw.githubusercontent.com/managerrojo/COAVANCOL-Prueba-T-cnica-/refs/heads/main/IndexAsociados";
                const peticion = await fetch(url);

                if (!peticion.ok) {
                    throw new Error(`Error en la petición: ${peticion.status}`);
                }
                
                // Aseguramos que la data coincida con nuestra interfaz
                const data: Usuario[] = await peticion.json(); 
                setUsuarios(data);

            } catch (err) {
                console.error("Error al obtener datos:", err);
                setError("No se pudieron cargar los datos de asociados.");
                setUsuarios([]); // Asegura que el array esté vacío
            } finally {
                setIsLoading(false); // Finaliza la carga
            }
        }
        solicitud();
    }, []);

    // 3. Manejador de Cambio del Select
    const handleFiltroChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setFiltroPipeline(event.target.value);
    };

    // 4. Lógica de Filtrado (Se ejecuta en cada renderizado)
    const usuariosFiltrados = usuarios.filter(usuario => {
        if (filtroPipeline === 'Todos') {
            return true; // Mostrar todos si el filtro es 'Todos'
        }
        // Mostrar solo los que coincidan exactamente con el filtro seleccionado
        return usuario.estado_pipeline === filtroPipeline;
    });

    // 5. Renderizado Condicional
    
    // Muestra el mensaje de error si existe
    if (error) {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                <h2> Error de Carga</h2>
                <p>{error}</p>
            </div>
        );
    }
    
    // Muestra el estado de carga
    if (isLoading) {
        return <div style={{ padding: '20px' }}>Cargando usuarios...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Lista de Asociados</h2>
            
            {/* Implementación del Filtro Select */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="filtro-estado">Filtrar por Estado de Pipeline:</label>
                <select 
                    id="filtro-estado" 
                    value={filtroPipeline} 
                    onChange={handleFiltroChange}
                    style={{ marginLeft: '10px', padding: '5px' }}
                >
                    {/* Mapea la lista fija de opciones */}
                    {OPCIONES_FILTRO.map(estado => (
                        <option key={estado} value={estado}>
                            {estado}
                        </option>
                    ))}
                </select>
            </div>

            <hr />

            {/* Muestra mensaje si no hay resultados tras el filtro */}
            <div>
                {usuariosFiltrados.length === 0 ? (
                    <p>No se encontraron asociados en el estado: **{filtroPipeline}**.</p>
                ) : (
                    // Mapeo de la lista FILTRADA
                    usuariosFiltrados.map((usuario) => (
                        <div key={usuario.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
                            <p>Identificación: **{usuario.Identificación}**</p>
                            <p>Nombre: **{usuario.Nombre}**</p>
                            <p>Estado Pipeline: **{usuario.estado_pipeline}**</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};