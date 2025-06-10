import React from 'react';

export const listarCampanas = () => {
	return (
		<div className='container mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>Listar Campañas</h1>
			<p className='text-gray-700 mb-4'>
				Aquí se van a listar todas las campañas!
			</p>
			<table className='min-w-full bg-white border border-gray-200'>
				<thead>
					<tr>
						<th className='py-2 px-4 border-b'>ID</th>
						<th className='py-2 px-4 border-b'>Nombre</th>
						<th className='py-2 px-4 border-b'>Descripción</th>
						<th className='py-2 px-4 border-b'>Fecha de Inicio</th>
						<th className='py-2 px-4 border-b'>Fecha de Fin</th>
					</tr>
				</thead>
				<tbody>{/* Aquí se pueden mapear las campañas */}</tbody>
			</table>
		</div>
	);
};
export default listarCampanas;
