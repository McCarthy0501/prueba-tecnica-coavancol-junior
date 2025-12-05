import { useState, useEffect, useMemo } from "react";


interface Usuario {
    id: number;
    estado_pipeline: string;
    Nombre: string; 
    Identificación: number;
}


export const TODOS_LOS_ESTADOS = [
    "Prospecto", "Expediente en Construcción", "Pendiente Jurídico", "Pendiente Cierre de Crédito", 
    "Pendiente Firma y Litivo", "Pendiente Revisión Abogado", "Cartera Activa", "Desembolsado/Finalizado",
];

// Lógica de Transiciones 
const TRANSICIONES_PERMITIDAS: { [key: string]: string[] } = {
    "Prospecto": ["Expediente en Construcción", "Pendiente Jurídico"],
    "Expediente en Construcción": ["Pendiente Jurídico", "Prospecto"],
    "Pendiente Jurídico": ["Pendiente Cierre de Crédito", "Pendiente Revisión Abogado"],
    "Pendiente Cierre de Crédito": ["Pendiente Firma y Litivo"],
    "Pendiente Firma y Litivo": ["Cartera Activa"],
    "Pendiente Revisión Abogado": ["Pendiente Cierre de Crédito", "Desembolsado/Finalizado"],
    "Cartera Activa": ["Desembolsado/Finalizado"],
    "Desembolsado/Finalizado": [], 
};


//  Back
async function actualizarEstadoEnDB(asociadoId: string, nuevoEstado: string, estadoActual: string): Promise<void> {
    console.log(`[API CALL] Solicitando cambiar ${asociadoId} de ${estadoActual} a ${nuevoEstado}`);
    
    // 1. VALIDACIÓN DE TRANSICIÓN (Simulación del Backend)
    const permitidas = TRANSICIONES_PERMITIDAS[estadoActual] || [];
    if (permitidas.length > 0 && !permitidas.includes(nuevoEstado)) {
        throw new Error(`Transición lógica no permitida: de ${estadoActual} a ${nuevoEstado}.`);
    }

    // 2. Simulación de la actualización en la DB y el registro de ultima_actualizacion
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    if (Math.random() > 0.95) { // 5% de fallo simulado
        throw new Error("Simulación: Error interno de la base de datos.");
    }
    console.log(`[API SUCCESS]: Asociado ${asociadoId} actualizado. (ultima_actualizacion registrada en DB)`);
}

/**
 * Hook personalizado 
 */
export const useAsociados = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filtroPipeline, setFiltroPipeline] = useState<string>('Todos');
    const [isUpdating, setIsUpdating] = useState<number | null>(null); // ID del que está cargando

   
    useEffect(() => {
        const solicitud = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const url = "https://raw.githubusercontent.com/managerrojo/COAVANCOL-Prueba-T-cnica-/refs/heads/main/IndexAsociados";
                const peticion = await fetch(url);

                if (!peticion.ok) {
                    throw new Error(`Error en la petición: ${peticion.status}`);
                }
                
                const data: Usuario[] = await peticion.json(); 
                setUsuarios(data.map(u => ({...u, id: Number(u.id)}))); // Asegurar que ID es number

            } catch (err) {
                console.error("Error al obtener datos:", err);
                setError("No se pudieron cargar los datos de asociados.");
                setUsuarios([]);
            } finally {
                setIsLoading(false);
            }
        }
        solicitud();
    }, []);

    // Ordenamiento
    const usuariosFiltradosYOrdenados = useMemo(() => {
        // 1. Filtrado
        const filtrados = usuarios.filter(usuario => {
            if (filtroPipeline === 'Todos') {
                return true;
            }
            return usuario.estado_pipeline === filtroPipeline;
        });

       
        return filtrados.sort((a, b) => {
            const nombreA = a.Nombre.toUpperCase();
            const nombreB = b.Nombre.toUpperCase();

            if (nombreA < nombreB) return -1;
            if (nombreA > nombreB) return 1;
            return 0; // Nombres iguales
        });
    }, [usuarios, filtroPipeline]);


    // intento de actualizacion tarea 2
    const handleActualizarEstado = async (id: number, nuevoEstado: string) => {
        const usuario = usuarios.find(u => u.id === id);
        if (!usuario) return;
        
        const estadoAnterior = usuario.estado_pipeline;
        
        setIsUpdating(id); 
        
        
        setUsuarios(oldUsers => 
            oldUsers.map(u => u.id === id ? { ...u, estado_pipeline: nuevoEstado } : u)
        );

        try {
            // Llama a la función Back
            await actualizarEstadoEnDB(String(id), nuevoEstado, estadoAnterior);
            
        } catch (err) {
            console.error("Error al actualizar el estado:", err);
            alert(`Fallo al actualizar el estado . Revertiendo cambio en la interfaz.`);
            
            
            setUsuarios(oldUsers => 
                oldUsers.map(u => u.id === id ? { ...u, estado_pipeline: estadoAnterior } : u)
            );
        } finally {
            setIsUpdating(null);
        }
    };

    return {
        usuariosFiltrados: usuariosFiltradosYOrdenados,
        isLoading,
        error,
        filtroPipeline,
        setFiltroPipeline,
        isUpdating,
        handleActualizarEstado,
    };
};