import React from 'react';
import { useAsociados, TODOS_LOS_ESTADOS } from '../hooks/Useasociados'; // Importamos el hook y las constantes

// Lista fija para el select de filtro 
const OPCIONES_FILTRO_GLOBAL = [
    'Todos', 'Prospecto', 'Expediente en Construcción', 
    'Pendiente Jurídico', 'Pendiente Cierre de Crédito'
];

// Estilos para el Diseño Limpio y Organizado
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '30px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    header: {
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px',
        marginBottom: '20px',
        color: '#333',
    },
    filtroContainer: {
        marginBottom: '25px',
        padding: '15px',
        backgroundColor: '#e9ecef',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
    },
    card: {
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '15px',
        marginBottom: '10px',
        backgroundColor: '#fff',
        transition: 'opacity 0.2s',
    },
    select: {
        marginLeft: '10px',
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ced4da',
    }
};

export const AsociadosList = () => {
    // 1. Usar el Hook Personalizado
    const { 
        usuariosFiltrados, 
        isLoading, 
        error, 
        filtroPipeline, 
        setFiltroPipeline,
        isUpdating,
        handleActualizarEstado 
    } = useAsociados();

    // 2. Renderizado Condicional
    if (error) {
        return (
            <div style={{ ...styles.container, color: 'red' }}>
                <h2 style={styles.header}> Error de Carga</h2>
                <p>{error}</p>
            </div>
        );
    }
    
    if (isLoading) {
        return <div style={styles.container}>Cargando asociados...</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>👥 Lista de Asociados</h2>
            
            {/* Filtro Global */}
            <div style={styles.filtroContainer}>
                <label htmlFor="filtro-estado">Filtrar por Estado:</label>
                <select 
                    id="filtro-estado" 
                    value={filtroPipeline} 
                    onChange={(e) => setFiltroPipeline(e.target.value)}
                    style={styles.select}
                >
                    {OPCIONES_FILTRO_GLOBAL.map(estado => (
                        <option key={estado} value={estado}>
                            {estado}
                        </option>
                    ))}
                </select>
            </div>

            {/* Renderizado */}
            <div>
                {usuariosFiltrados.length === 0 ? (
                    <p>No se encontraron asociados en el estado: **{filtroPipeline}**.</p>
                ) : (
                    usuariosFiltrados.map((usuario) => (
                        // La opacidad baja mientras se actualiza (Feedback visual)
                        <div key={usuario.id} style={{ ...styles.card, opacity: isUpdating === usuario.id ? 0.6 : 1 }}>
                            
                            <h3>**{usuario.Nombre}** (ID: {usuario.Identificación})</h3>
                            
                            {/* SELECT PARA CAMBIAR EL ESTADO INDIVIDUAL (Tarea 2) */}
                            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                <label>Estado Actual: **{usuario.estado_pipeline}** | Cambiar a:</label>
                                <select
                                    value={usuario.estado_pipeline}
                                    onChange={(e) => handleActualizarEstado(usuario.id, e.target.value)}
                                    disabled={isUpdating === usuario.id} // Deshabilitado durante la carga
                                    style={styles.select}
                                >
                                    {/* Opciones de estados completas para la actualización */}
                                    {TODOS_LOS_ESTADOS.map(estado => (
                                        <option key={estado} value={estado}>
                                            {estado}
                                        </option>
                                    ))}
                                </select>
                                {isUpdating === usuario.id && <span style={{ marginLeft: '10px', color: '#007bff' }}>🔄 Guardando...</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};