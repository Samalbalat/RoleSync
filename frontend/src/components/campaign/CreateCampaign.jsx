import {
	Card,
	Input,
	Select,
	Textarea,
	Option,
	Button,
} from '@material-tailwind/react';
import { RPG_SYSTEM_ENUM } from '../../data/RPGSystem';
import { LANGUAGE_ENUM } from '../../data/lenguageList';
import { COMUNICATION } from '../../data/comunicationList';
import { WEEKDAY_ENUM } from '../../data/weekdayList';
import { TIMEZONE_ENUM } from '../../data/timeZoneList';
import React from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { TiDelete } from 'react-icons/ti';
import { FaRegFileImage } from 'react-icons/fa';

export default function CreateCampaign({
	isMobileSize,
	midSize,
	//user_email,
	//profile_type,
}) {
	const fileInputRef = React.useRef(null);
	const [image, setImage] = React.useState('');
	const [fileName, setFileName] = React.useState('');
	let formContent;
	if (isMobileSize) {
		// Formato para móviles
		formContent = (
			<>
				<div className='flex flex-col items-center gap-3'>
					<div className='bg-gray-200 rounded-lg w-60 p-2 flex flex-col justify-center items-center'>
						<div
							className={`w-full h-52 rounded-lg flex justify-center items-center overflow-hidden${image ? '' : ' border-dashed border-2 border-blue-500 text-blue-500'}`}
						>
							{image ? (
								<img
									className='w-full h-full object-contain rounded-xl'
									src={image}
									alt={fileName}
								/>
							) : (
								<div>
									<AiOutlineCloudUpload className='h-12 w-12' />
								</div>
							)}
						</div>
						<input
							type='file'
							className='hidden'
							accept='image/png, image/jpeg, image/jpg'
							ref={fileInputRef}
							onChange={e => {
								if (e.target.files && e.target.files.length > 0) {
									const file = e.target.files[0];
									if (file) {
										setFileName(file.name);
										setImage(URL.createObjectURL(file));
									}
								}
							}}
						/>
					</div>
					<Button
						variant='gradient'
						className='flex items-center gap-3'
						type='button'
						onClick={() => fileInputRef.current && fileInputRef.current.click()}
					>
						<AiOutlineCloudUpload className='h-6 w-6' />
						Subir Foto
					</Button>
				</div>
				<Input
					label='Nombre del rol'
					className='w-full max-w-[500px] mx-auto text-base py-3'
				/>
				<Select
					label='Sistema'
					name='rgpsystem'
					className='w-full max-w-[500px] mx-auto text-base py-3'
				>
					{Object.values(RPG_SYSTEM_ENUM).map(system => (
						<Option key={system} value={system}>
							{system}
						</Option>
					))}
				</Select>
				<Input
					label='Temática'
					className='w-full max-w-[500px] mx-auto text-base py-3'
				/>
				<Select
					label='Idioma'
					name='idioma'
					className='w-full max-w-[500px] mx-auto text-base py-3'
				>
					{Object.values(LANGUAGE_ENUM).map(language => (
						<Option key={language} value={language}>
							{language}
						</Option>
					))}
				</Select>
				<Input
					label='Localización'
					className='w-full max-w-[500px] mx-auto text-base py-3'
				/>
				<Input
					label='Número de personas'
					className='w-full max-w-[500px] mx-auto text-base py-3'
				/>
				<Select
					label='Comunicación'
					name='comunicacion'
					className='w-full max-w-[500px] mx-auto text-base py-3'
				>
					{Object.values(COMUNICATION).map(comunicacion => (
						<Option key={comunicacion} value={comunicacion}>
							{comunicacion}
						</Option>
					))}
				</Select>
				<Select
					label='Día de la semana'
					name='diaSemana'
					className='w-full max-w-[500px] mx-auto text-base py-3'
				>
					{Object.values(WEEKDAY_ENUM).map(dia => (
						<Option key={dia} value={dia}>
							{dia}
						</Option>
					))}
				</Select>
				<Select
					label='Horario GMT'
					name='horarioGMT'
					className='w-full max-w-[500px] mx-auto text-base py-3'
				>
					{Object.values(TIMEZONE_ENUM).map(hora => (
						<Option key={hora} value={hora}>
							{hora}
						</Option>
					))}
				</Select>
				<Select
					label='Frecuencia'
					name='frecuencia'
					className='w-full max-w-[500px] mx-auto text-base py-3'
				>
					<Option value='cada_semana'>Cada semana</Option>
					<Option value='cada_dos_semanas'>Cada dos semanas</Option>
					<Option value='mensual'>Mensual</Option>
				</Select>
				<Input
					label='Duración por partida/horas'
					className='w-full max-w-[500px] mx-auto text-base py-3'
				/>
				<Textarea
					label='Descripción'
					className='w-full max-w-[500px] mx-auto min-h-[140px] text-base py-3'
				/>
				<div className='flex justify-center'>
					<Button
						type='submit'
						variant='gradient'
						className='mt-2 w-auto px-6'
						size='md'
					>
						Crear campaña
					</Button>
				</div>
			</>
		);
	} else if (midSize) {
		// Formato para pantallas medianas
		formContent = (
			<>
				<div className='flex flex-col items-center gap-3 mb-4'>
					<div className='bg-gray-200 rounded-lg w-60 p-2 flex flex-col justify-center items-center'>
						<div
							className={`w-full h-52 rounded-lg flex justify-center items-center overflow-hidden${image ? '' : ' border-dashed border-2 border-blue-500 text-blue-500'}`}
						>
							{image ? (
								<img
									className='w-full h-full object-contain rounded-xl'
									src={image}
									alt={fileName}
								/>
							) : (
								<div>
									<AiOutlineCloudUpload className='h-12 w-12' />
								</div>
							)}
						</div>
						<input
							type='file'
							className='hidden'
							accept='image/png, image/jpeg, image/jpg'
							ref={fileInputRef}
							onChange={e => {
								if (e.target.files && e.target.files.length > 0) {
									const file = e.target.files[0];
									if (file) {
										setFileName(file.name);
										setImage(URL.createObjectURL(file));
									}
								}
							}}
						/>
					</div>
					<Button
						variant='gradient'
						className='flex items-center gap-3'
						type='button'
						onClick={() => fileInputRef.current && fileInputRef.current.click()}
					>
						<AiOutlineCloudUpload className='h-6 w-6' />
						Subir Foto
					</Button>
				</div>

				<div className='grid grid-cols-2 gap-4 mb-4'>
					<div className='flex flex-col gap-4'>
						<Input label='Nombre del rol' className='w-full text-base py-3' />
						<Select
							label='Sistema'
							name='rgpsystem'
							className='w-full text-base py-3'
						>
							{Object.values(RPG_SYSTEM_ENUM).map(system => (
								<Option key={system} value={system}>
									{system}
								</Option>
							))}
						</Select>
						<Input label='Temática' className='w-full text-base py-3' />
						<Select
							label='Idioma'
							name='idioma'
							className='w-full text-base py-3'
						>
							{Object.values(LANGUAGE_ENUM).map(language => (
								<Option key={language} value={language}>
									{language}
								</Option>
							))}
						</Select>
						<Input label='Localización' className='w-full text-base py-3' />
					</div>
					<div className='flex flex-col gap-4'>
						<Input
							label='Número de personas'
							className='w-full text-base py-3'
						/>
						<Select
							label='Comunicación'
							name='comunicacion'
							className='w-full text-base py-3'
						>
							{Object.values(COMUNICATION).map(comunicacion => (
								<Option key={comunicacion} value={comunicacion}>
									{comunicacion}
								</Option>
							))}
						</Select>
						<Select
							label='Día de la semana'
							name='diaSemana'
							className='w-full text-base py-3'
						>
							{Object.values(WEEKDAY_ENUM).map(dia => (
								<Option key={dia} value={dia}>
									{dia}
								</Option>
							))}
						</Select>
						<Select
							label='Horario GMT'
							name='horarioGMT'
							className='w-full text-base py-3'
						>
							{Object.values(TIMEZONE_ENUM).map(hora => (
								<Option key={hora} value={hora}>
									{hora}
								</Option>
							))}
						</Select>
						<Select
							label='Frecuencia'
							name='frecuencia'
							className='w-full text-base py-3'
						>
							<Option value='cada_semana'>Cada semana</Option>
							<Option value='cada_dos_semanas'>Cada dos semanas</Option>
							<Option value='mensual'>Mensual</Option>
						</Select>
						<Input
							label='Duración por partida/horas'
							className='w-full text-base py-3'
						/>
					</div>
				</div>

				<div className='flex flex-col gap-4'>
					<Textarea
						label='Descripción'
						className='w-full min-h-[140px] text-base py-3'
					/>
					<div className='flex justify-center'>
						<Button
							type='submit'
							variant='gradient'
							className='mt-2 w-auto px-6'
							size='md'
						>
							Crear campaña
						</Button>
					</div>
				</div>
			</>
		);
	} else {
		// Formato para pantallas grandes
		formContent = (
			<>
				<div className={`flex flex-col gap-6 md:col-span-2`}>
					<div className='flex flex-row gap-8'>
						<div className='flex flex-col items-center gap-2'>
							<div className='bg-gray-200 rounded-lg w-60 p-2 flex flex-col justify-center items-center'>
								<div
									className={`w-full h-52 rounded-lg flex justify-center items-center overflow-hidden${image ? '' : ' border-dashed border-2 border-blue-500 text-blue-500'}`}
								>
									{image ? (
										<img
											className='w-full h-full object-contain rounded-xl'
											src={image}
											alt={fileName}
										/>
									) : (
										<div>
											<AiOutlineCloudUpload className='h-12 w-12' />
										</div>
									)}
								</div>
								<input
									type='file'
									className='hidden'
									accept='image/png, image/jpeg, image/jpg'
									ref={fileInputRef}
									onChange={e => {
										if (e.target.files && e.target.files.length > 0) {
											const file = e.target.files[0];
											if (file) {
												setFileName(file.name);
												setImage(URL.createObjectURL(file));
											}
										}
									}}
								/>
							</div>
							<Button
								variant='gradient'
								className='flex items-center gap-3'
								type='button'
								onClick={() =>
									fileInputRef.current && fileInputRef.current.click()
								}
							>
								<AiOutlineCloudUpload className='h-6 w-6' />
								Subir Foto
							</Button>
						</div>

						<div className='flex flex-col gap-6 flex-1'>
							<Input label='Nombre del rol' className='w-full text-base py-3' />
							<Select
								label='Sistema'
								name='rgpsystem'
								className='w-full text-base py-3'
							>
								{Object.values(RPG_SYSTEM_ENUM).map(system => (
									<Option key={system} value={system}>
										{system}
									</Option>
								))}
							</Select>
							<Input label='Temática' className='w-full text-base py-3' />
							<Select
								label='Idioma'
								name='idioma'
								className='w-full text-base py-3'
							>
								{Object.values(LANGUAGE_ENUM).map(language => (
									<Option key={language} value={language}>
										{language}
									</Option>
								))}
							</Select>
							<Input label='Localización' className='w-full text-base py-3' />
						</div>
					</div>

					<div>
						<Textarea
							label='Descripción'
							className='w-full min-h-[140px] text-base py-3'
						/>
					</div>
				</div>

				<div className={`flex flex-col gap-6 md:col-span-1`}>
					<Input label='Número de personas' className='w-full text-base py-3' />
					<Select
						label='Comunicación'
						name='comunicacion'
						className='w-full text-base py-3'
					>
						{Object.values(COMUNICATION).map(comunicacion => (
							<Option key={comunicacion} value={comunicacion}>
								{comunicacion}
							</Option>
						))}
					</Select>
					<Select
						label='Día de la semana'
						name='diaSemana'
						className='w-full text-base py-3'
					>
						{Object.values(WEEKDAY_ENUM).map(dia => (
							<Option key={dia} value={dia}>
								{dia}
							</Option>
						))}
					</Select>
					<Select
						label='Horario GMT'
						name='horarioGMT'
						className='w-full text-base py-3'
					>
						{Object.values(TIMEZONE_ENUM).map(hora => (
							<Option key={hora} value={hora}>
								{hora}
							</Option>
						))}
					</Select>
					<Select
						label='Frecuencia'
						name='frecuencia'
						className='w-full text-base py-3'
					>
						<Option value='cada_semana'>Cada semana</Option>
						<Option value='cada_dos_semanas'>Cada dos semanas</Option>
						<Option value='mensual'>Mensual</Option>
					</Select>
					<Input
						label='Duración por partida/horas'
						className='w-full text-base py-3'
					/>
					<div className='flex justify-center'>
						<Button
							type='submit'
							variant='gradient'
							className='mt-2 w-auto px-6'
							size='md'
						>
							Crear campaña
						</Button>
					</div>
				</div>
			</>
		);
	}

	return (
		<Card
			className={`w-full ${isMobileSize ? 'p-8' : midSize ? 'max-w-2xl p-10' : 'max-w-6xl p-12'} mx-auto rounded-3xl shadow-2xl bg-white flex flex-col ${isMobileSize ? 'gap-4' : midSize ? 'gap-6' : 'gap-8'}`}
		>
			<h2 className='text-2xl font-bold text-blue-gray-900 mb-1'>
				Crear Campaña
			</h2>
			<form
				className={
					isMobileSize
						? 'flex flex-col gap-5'
						: midSize
							? 'flex flex-col gap-8'
							: 'grid grid-cols-1 md:grid-cols-3 gap-12'
				}
			>
				{formContent}
			</form>
		</Card>
	);
}
