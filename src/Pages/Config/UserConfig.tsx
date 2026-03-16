"use client";

import { useStore } from "@/components/Context/ContextSucursal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import {
  AtSign,
  Building,
  ChromeIcon as ChartNoAxesColumn,
  Shield,
  ToggleLeft,
  UserIcon,
  Edit,
  Trash2,
  Lock,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageTransition } from "@/components/Transition/layout-transition";

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: number;
  nombre: string;
  activo: boolean;
  correo: string;
  rol: string;
  contrasena?: string;
  contrasenaConfirm?: string;
}

interface Sucursal {
  id: number;
  nombre: string;
}

interface UsuarioResponse {
  id: number;
  activo: boolean;
  nombre: string;
  correo: string;
  sucursal: Sucursal;
  rol: string;
  totalVentas: number;
}

function UserConfig() {
  const userId = useStore((state) => state.userId);
  const userRol = useStore((state) => state.userRol);

  const [user, setUser] = useState<User>({
    activo: true,
    correo: "",
    id: 0,
    nombre: "",
    rol: "",
    contrasena: "",
    contrasenaConfirm: "",
  });

  const [userEdit, setUserEdit] = useState<User>({
    id: 0,
    activo: true,
    correo: "",
    nombre: "",
    rol: "",
    contrasena: "",
    contrasenaConfirm: "",
  });

  const [users, setUsers] = useState<UsuarioResponse[]>([]);
  const [truncateClose, setTruncateClose] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const getUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/fin-my-user/${userId}`);
      if (response.status === 200) {
        const userData = response.data;
        setUser({
          ...user,
          ...userData,
          contrasena: "",
          contrasenaConfirm: "",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al conseguir datos");
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/fin-all-users`);
      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al conseguir datos");
    }
  };

  useEffect(() => {
    if (userId) {
      getUser();
    }
  }, [userId]);

  useEffect(() => {
    getUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (truncateClose) return;
    setTruncateClose(true);

    if (!user.contrasenaConfirm) {
      toast.info("Ingrese su contraseña para confirmar el cambio");
      setTruncateClose(false);
      return;
    }

    try {
      const response = await axios.patch(
        `${API_URL}/user/update-user/${userId}`,
        user,
      );
      if (response.status === 201 || response.status === 200) {
        toast.success("Usuario actualizado correctamente");
        getUser();
        setCloseConfirm(false);
      }
    } catch (error) {
      toast.error("Error al registrar cambio, verifique sus credenciales.");
    } finally {
      setTruncateClose(false);
    }
  };

  const handleChangeInputs = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setUser((datosPrevios) => ({
      ...datosPrevios,
      [name]: value,
    }));
  };

  const handleToggleEditActivo = (key: keyof User) => {
    setUserEdit((previaData) => ({
      ...previaData,
      [key]: !previaData[key],
    }));
  };

  const handleChangeEditUser = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setUserEdit((datosPrevios) => ({
      ...datosPrevios,
      [name]: value,
    }));
  };

  const canEditUser = (targetUserId: number): boolean => {
    if (userRol === "SUPER_ADMIN") return true;
    return userId === targetUserId;
  };

  const handleSubmitEditUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEditUser(userEdit.id)) {
      toast.error("No tienes permisos para editar este usuario");
      return;
    }

    if (!userEdit.contrasenaConfirm) {
      toast.info("Ingrese su contraseña para confirmar el cambio");
      return;
    }

    try {
      const payload = {
        userId: userEdit.id,
        nombre: userEdit.nombre,
        correo: userEdit.correo,
        rol: userEdit.rol,
        activo: userEdit.activo,
        nuevaContrasena: userEdit.contrasena || undefined,
        adminPassword: userEdit.contrasenaConfirm,
      };

      const response = await axios.patch(
        `${API_URL}/user/update-user/as-admin/${userId}`,
        payload,
      );

      if (response.status === 200 || response.status === 201) {
        getUsers();
        toast.success("Usuario Actualizado");
        setOpenEdit(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al editar usuario");
    }
  };

  const getRolBadgeVariant = (rol: string) => {
    switch (rol) {
      case "SUPER_ADMIN":
        return "destructive";
      case "ADMIN":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <PageTransition fallbackBackTo="/" titleHeader="Usuarios y Config.">
      <Tabs defaultValue="usuario" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="usuario" className="flex-1">
              Mi Usuario
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex-1">
              Todos los Usuarios
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Mi Usuario */}
        <TabsContent value="usuario">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Editar Mi Perfil</CardTitle>
              <CardDescription>
                Actualiza tu información personal y cambia tu contraseña.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      type="text"
                      value={user.nombre || ""}
                      onChange={handleChangeInputs}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo electrónico</Label>
                    <Input
                      id="correo"
                      name="correo"
                      type="email"
                      value={user.correo || ""}
                      onChange={handleChangeInputs}
                      placeholder="tu@correo.com"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Cambiar contraseña
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="contrasena">Nueva contraseña</Label>
                    <Input
                      id="contrasena"
                      name="contrasena"
                      type="password"
                      value={user.contrasena || ""}
                      onChange={handleChangeInputs}
                      placeholder="Deja en blanco para mantener la actual"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contrasenaConfirm">
                      Confirmar con tu contraseña actual
                    </Label>
                    <Input
                      id="contrasenaConfirm"
                      name="contrasenaConfirm"
                      type="password"
                      value={user.contrasenaConfirm || ""}
                      onChange={handleChangeInputs}
                      placeholder="Tu contraseña actual"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  type="button"
                  onClick={() => setCloseConfirm(true)}
                >
                  Actualizar información
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Dialog de confirmación para actualizar perfil */}
          <Dialog open={closeConfirm} onOpenChange={setCloseConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar actualización</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas actualizar tu información? Los
                  cambios se guardarán inmediatamente.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setCloseConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSubmit}>
                  Confirmar cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab: Lista de Usuarios */}
        <TabsContent value="usuarios" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Usuarios</h2>
            </div>
            <Badge variant="outline" className="text-sm">
              {users.length} {users.length === 1 ? "usuario" : "usuarios"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users && users.length > 0 ? (
              users.map((usuario) => {
                const canEdit = canEditUser(usuario.id);
                const isSuperAdmin = userRol === "SUPER_ADMIN";

                return (
                  <Card
                    key={usuario.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="truncate">{usuario.nombre}</span>
                          </CardTitle>
                        </div>
                        <Badge variant={getRolBadgeVariant(usuario.rol)}>
                          {usuario.rol === "SUPER_ADMIN" && (
                            <Shield className="h-3 w-3 mr-1" />
                          )}
                          {usuario.rol}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <AtSign className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground truncate">
                            {usuario.correo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground truncate">
                            {usuario.sucursal.nombre}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ChartNoAxesColumn className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">
                            {usuario.totalVentas} ventas
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <ToggleLeft
                            className={`h-4 w-4 ${
                              usuario.activo
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {usuario.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-2 bg-muted/50">
                      <Button
                        onClick={() => {
                          setUserEdit({
                            activo: usuario.activo,
                            correo: usuario.correo,
                            id: usuario.id,
                            nombre: usuario.nombre,
                            rol: usuario.rol,
                            contrasena: "",
                            contrasenaConfirm: "",
                          });
                          setOpenEdit(true);
                        }}
                        disabled={!canEdit}
                        variant="default"
                        className="flex-1"
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        disabled={!isSuperAdmin}
                        variant="destructive"
                        className="flex-1"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  No hay usuarios para mostrar
                </p>
              </div>
            )}
          </div>

          {/* Dialog para editar usuario */}
          <Dialog onOpenChange={setOpenEdit} open={openEdit}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Editar Usuario: {userEdit.nombre}
                </DialogTitle>
                <DialogDescription>
                  {canEditUser(userEdit.id)
                    ? "Realiza cambios en la información del usuario."
                    : "Solo puedes editar tu propio usuario."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmitEditUser} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nombre">Nombre</Label>
                    <Input
                      name="nombre"
                      onChange={handleChangeEditUser}
                      id="edit-nombre"
                      value={userEdit.nombre}
                      disabled={!canEditUser(userEdit.id)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-correo">Correo</Label>
                    <Input
                      name="correo"
                      onChange={handleChangeEditUser}
                      id="edit-correo"
                      type="email"
                      value={userEdit.correo}
                      disabled={!canEditUser(userEdit.id)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-contrasena">
                      Nueva contraseña (opcional)
                    </Label>
                    <Input
                      onChange={handleChangeEditUser}
                      id="edit-contrasena"
                      name="contrasena"
                      type="password"
                      value={userEdit.contrasena || ""}
                      placeholder="Dejar en blanco para mantener actual"
                      disabled={!canEditUser(userEdit.id)}
                    />
                  </div>

                  {userRol === "SUPER_ADMIN" && (
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="edit-activo" className="text-base">
                          Estado del usuario
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {userEdit.activo
                            ? "Usuario activo"
                            : "Usuario desactivado"}
                        </p>
                      </div>
                      <Switch
                        id="edit-activo"
                        checked={userEdit.activo}
                        onCheckedChange={() => handleToggleEditActivo("activo")}
                      />
                    </div>
                  )}

                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="edit-contrasenaConfirm">
                      Confirmar con tu contraseña
                    </Label>
                    <Input
                      onChange={handleChangeEditUser}
                      id="edit-contrasenaConfirm"
                      name="contrasenaConfirm"
                      type="password"
                      placeholder="Tu contraseña de administrador"
                      value={userEdit.contrasenaConfirm || ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ingresa tu contraseña actual para confirmar los cambios
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenEdit(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={!canEditUser(userEdit.id)}>
                    Guardar cambios
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}

export default UserConfig;
