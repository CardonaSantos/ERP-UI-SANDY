"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_API_URL;

export default function CreateSucursal() {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [tipoSucursal, setTipoSucursal] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ nombre, direccion, telefono, tipoSucursal });
    try {
      // El objeto con las propiedades debe ser enviado directamente
      const nuevaSucursal = {
        nombre: nombre, // O solo "nombre," si los nombres de variables coinciden
        direccion: direccion,
        telefono: telefono,
        tipoSucursal: tipoSucursal,
      };
      const response = await axios.post(`${API_URL}/sucursales`, nuevaSucursal); // Enviar directamente el objeto
      if (response.status === 201) {
        toast.success("Sucursal creada");
        setNombre("");
        setDireccion("");
        setTelefono("");
        setTipoSucursal("");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al crear sucursal");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Crear Nueva Sucursal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Sucursal</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoSucursal">Tipo de Sucursal</Label>
            <Select onValueChange={setTipoSucursal} value={tipoSucursal}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo de sucursal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TIENDA">TIENDA</SelectItem>
                <SelectItem value="ALMACEN">ALMACEN</SelectItem>
                <SelectItem value="CENTRO_DISTRIBUCION">
                  CENTRO DISTRIBUCION
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            {/* <Switch
              id="estadoOperacion"
              checked={estadoOperacion}
              onCheckedChange={setEstadoOperacion}
            />
            <Label htmlFor="estadoOperacion">Sucursal Activa</Label> */}
          </div>
          <Button type="submit" className="w-full">
            Crear Sucursal
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
