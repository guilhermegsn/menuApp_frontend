import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React from 'react'

const states = [
	{
		id: "AM",
		name: "Amazonas"
	},
	{
		id: "AC",
		name: "Acre"
	},
	{
		id: "AL",
		name: "Alagoas"
	},
	{
		id: "AP",
		name: "Amapá"
	},
	{
		id: "BA",
		name: "Bahia"
	},
	{
		id: "CE",
		name: "Ceará"
	},
	{
		id: "DF",
		name: "Distrito Federal"
	},
	{
		id: "ES",
		name: "Espírito Santo"
	},
	{
		id: "GO",
		name: "Goiás"
	},
	{
		id: "MA",
		name: "Maranhão"
	},
	{
		id: "MT",
		name: "Mato Grosso"
	},
	{
		id: "MS",
		name: "Mato Grosso do Sul"
	},
	{
		id: "MG",
		name: "Minas Gerais"
	},
	{
		id: "PA",
		name: "Pará"
	},
	{
		id: "PB",
		name: "Paraíba"
	},
	{
		id: "PR",
		name: "Paraná"
	},
	{
		id: "PE",
		name: "Pernambuco"
	},
	{
		id: "PI",
		name: "Piauí"
	},
	{
		id: "RJ",
		name: "Rio de Janeiro"
	},
	{
		id: "RN",
		name: "Rio Grande do Norte"
	},
	{
		id: "RS",
		name: "Rio Grande do Sul"
	},
	{
		id: "RO",
		name: "Rondônia"
	},
	{
		id: "RR",
		name: "Roraima"
	},
	{
		id: "SC",
		name: "Santa Catarina"
	},
	{
		id: "SP",
		name: "São Paulo"
	},
	{
		id: "SE",
		name: "Sergipe"
	},
	{
		id: "TO",
		name: "Tocantins"
	}
]

export default function BrazilianStates({value, onChange}) {
	return (
		<div>
			<FormControl fullWidth variant="standard">
			 <InputLabel id="demo-simple-select-label">Estado</InputLabel>
			<Select
				label="Estado"
				variant="standard"
				value={value ? value : ""}
				onChange={onChange ? onChange : null}
			>
				{states.map((item) => (
						<MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
				))}
			</Select>
			</FormControl>
		</div>
	)
}
