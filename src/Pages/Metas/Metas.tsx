import { useStore } from "@/components/Context/ContextSucursal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowDownIcon,
  ArrowUpIcon,
  Banknote,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Coins,
  CreditCard,
  Delete,
  Edit,
  FileText,
  Lock,
  MoreVertical,
  Percent,
  Store,
  Target,
  TargetIcon,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import SelectComponent, { SingleValue } from "react-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import advancedFormat from "dayjs/plugin/advancedFormat";
import currency from "currency.js";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/utils/components/PageHeaderPos";
import { EditMetaTiendaDialog } from "./EditMetaTiendaDialog";
import { EditMetaCobroDialog } from "./EditMetaCobroDialog";
import {
  DepositoCobro,
  EstadoMetaCobro,
  EstadoMetaTienda,
  MetaCobros,
  MetaInterfaceDTO,
  MetaTienda,
  TipoMeta,
} from "./types";
import {
  useCreateMetaCobro,
  useCreateMetaTienda,
  useDeleteDepositoCobro,
  useDeleteMetaCobro,
  useDeleteMetaTienda,
  useMetasCobros,
  useMetasSummary,
  useMetasTienda,
  useMetasUsers,
} from "@/hooks/metas-hook/useMetas";
import { getApiErrorMessageAxios } from "../Utils/UtilsErrorApi";

dayjs.extend(advancedFormat);
dayjs.extend(dayOfYear);
dayjs.extend(isLeapYear);

interface OptionSelected {
  value: number;
  label: string;
}

function Metas() {
  const userRol = useStore((state) => state.userRol) ?? "";
  /* ========================= Context ========================= */
  const userId = useStore((s) => s.userId) ?? 0;
  const sucursalId = useStore((s) => s.sucursalId) ?? 0;

  /* ========================= Queries ========================= */
  const { data: metasTienda = [] } = useMetasTienda(sucursalId);
  const { data: metasCobros = [] } = useMetasCobros(sucursalId);
  const { data: usuarios = [] } = useMetasUsers();
  const { data: s } = useMetasSummary();

  const summary = s ?? { metasTienda: [], metasCobros: [] };
  const metasTiendaSummary = summary.metasTienda;
  const metasCobrosSummary = summary.metasCobros;

  /* ========================= Mutations (hooks) ========================= */
  const createTienda = useCreateMetaTienda();
  const createCobro = useCreateMetaCobro();
  const deleteTienda = useDeleteMetaTienda();
  const deleteCobro = useDeleteMetaCobro();
  const deleteDeposito = useDeleteDepositoCobro();

  /* ========================= Local state (kept names used by JSX) ========================= */
  const [searchTerm, setSearchTerm] = useState("");

  const [metaDto, setMetaDto] = useState<MetaInterfaceDTO>({
    usuarioId: 0,
    tipoMeta: "Tienda",
    tituloMeta: "",
    montoMeta: 0,
    fechaFin: "",
    sucursalId,
  });

  console.log("El set: ", setSearchTerm);

  const [opcionSeleccionada, setOpcionSeleccionada] = useState<{
    value: number;
    label: string;
  } | null>(null);

  const [metaTiendaSelected, setMetaTiendaSelected] =
    useState<MetaTienda | null>(null);
  const [metaCobroSelected, setMetaCobroSelected] = useState<MetaCobros | null>(
    null
  );

  const [openUpdateMetaTienda, setOpenUpdateMetaTienda] = useState(false);
  const [openUpdateMetaCobro, setOpenUpdateMetaCobro] = useState(false);

  /* usado en el JSX para eliminar cobros */
  const [CobroToDelete, setCobroToDelete] = useState(0);

  /* diálogos de eliminación (tienda / cobro) */
  const [openDeleteG, setOpenDeleteG] = useState(false); // mantiene nombre original (usado en JSX)
  const [openDeleteCobro, setOpenDeleteCobro] = useState(false);

  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);
  const [passwordAdmin, setPasswordAdmin] = useState("");
  const [passwordAdminCobro, setPasswordAdminCobro] = useState("");

  /* depósitos dialog */
  const [openDepositosDialog, setOpenDepositosDialog] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<MetaCobros | undefined>(
    undefined
  );

  /* selectedDepo (usado en JSX para confirmar eliminación de depósito) */
  const [selectedDepo, setSelectedDepo] = useState<DepositoCobro | undefined>(
    undefined
  );

  /* auxiliar para eliminar depósitos (modal confirm) */
  const [openDeletDepo, setOpenDeletDepo] = useState(false);

  /* ========================= Computed / Memos ========================= */

  const filteredMetasTienda = useMemo(
    () =>
      metasTienda.filter(
        (m) =>
          m.tituloMeta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.sucursal.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [metasTienda, searchTerm]
  );

  const filteredMetasCobros = useMemo(
    () =>
      metasCobros.filter(
        (m) =>
          m.tituloMeta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.sucursal.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [metasCobros, searchTerm]
  );

  const optionsUsuarios = useMemo(
    () =>
      usuarios.map((u) => ({
        value: u.id,
        label: `${u.nombre} (${u.sucursal.nombre})`,
      })),
    [usuarios]
  );

  /* ========================= Helpers ========================= */

  const formatearMoneda = (m: number) =>
    currency(m, {
      symbol: "Q",
      separator: ",",
      decimal: ".",
      precision: 2,
    }).format();

  const calcularReferencia = () => {
    const totalDias = dayjs().daysInMonth();
    return (dayjs().date() / totalDias) * 100;
  };

  /* ========================= Handlers (mutations via hooks + toasts) ========================= */

  /**
   * Crear meta (Tienda o Cobro) usando las mutaciones.
   * Mantiene el mismo comportamiento que antes + toast.promise.
   */
  const handleSubmitGoal = async () => {
    try {
      const { usuarioId, tipoMeta, fechaFin, montoMeta } = metaDto;
      if (!usuarioId || !tipoMeta || !fechaFin || !montoMeta) {
        toast.info("Faltan datos para continuar");
        return;
      }

      const payload = { ...metaDto, fechaFin: new Date(fechaFin), sucursalId };
      const mutation = tipoMeta === "Tienda" ? createTienda : createCobro;

      toast.promise(mutation.mutateAsync(payload), {
        loading: "Registrando meta...",
        success: "Meta registrada correctamente",
        error: (e) => getApiErrorMessageAxios(e),
      });
    } catch (error) {
      console.log(error);
    } finally {
      resetForm();
    }
  };

  const handleChangeUser = (op: SingleValue<OptionSelected>) => {
    setOpcionSeleccionada(op);
    setMetaDto((prev) => ({ ...prev, usuarioId: op?.value ?? 0 }));
  };

  const resetForm = () => {
    setMetaDto({
      usuarioId: 0,
      tipoMeta: "Tienda",
      tituloMeta: "",
      montoMeta: 0,
      fechaFin: "",
      sucursalId,
    });
    setOpcionSeleccionada(null);
  };

  /**
   * Eliminar meta de TIENDA (dialog que en tu JSX llama handleDeleteMeta)
   * Reemplaza la llamada axios anterior, usa la mutación y cierra modal.
   */
  const handleDeleteMeta = () => {
    try {
      if (!goalToDelete || !userId || !passwordAdmin || goalToDelete <= 0) {
        toast.info("Faltan datos para completar la acción");
        return;
      }

      toast.promise(
        deleteTienda.mutateAsync({
          goalId: goalToDelete,
          userId,
          passwordAdmin,
        }),
        {
          loading: "Eliminando meta...",
          success: "Meta eliminada",
          error: (e) => getApiErrorMessageAxios(e),
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      setOpenDeleteG(false);
      setPasswordAdmin("");
      setGoalToDelete(null);
    }
  };

  /**
   * Eliminar meta de COBRO (dialog específico para cobros).
   * Mantengo el nombre handleDeleteCobro porque el JSX lo llama así.
   */
  const handleDeleteCobro = () => {
    try {
      if (
        !CobroToDelete ||
        !userId ||
        !passwordAdminCobro ||
        CobroToDelete <= 0
      ) {
        toast.info("Faltan datos para completar la acción");
        return;
      }

      toast.promise(
        deleteCobro.mutateAsync({
          cobroId: CobroToDelete,
          userId,
          passwordAdmin: passwordAdminCobro,
        }),
        {
          loading: "Eliminando meta...",
          success: "Meta eliminada",
          error: (e) => getApiErrorMessageAxios(e),
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      setOpenDeleteCobro(false);
      setPasswordAdminCobro("");
      setCobroToDelete(0);
    }
  };

  /**
   * Abrir dialogo de depósitos (mantengo nombre handler usado en JSX).
   */
  const handleOpenDepositos = (meta: MetaCobros) => {
    setSelectedMeta(meta);
    setOpenDepositosDialog(true);
  };

  /**
   * Confirmación de eliminación de depósito (usado en el dialog de depósitos).
   * Reemplaza el axios.delete anterior por la mutación deleteDeposito.
   */
  const onConfirmDelete = () => {
    if (!selectedMeta || !selectedDepo) {
      toast.info("Selecciona el depósito a eliminar");
      return;
    }

    try {
      toast.promise(
        deleteDeposito.mutateAsync({
          metaId: selectedMeta.id,
          depositoId: selectedDepo.id,
        }),
        {
          loading: "Eliminando depósito...",
          success: "Depósito eliminado",
          error: (e) => getApiErrorMessageAxios(e),
        }
      );
    } catch (error) {
      console.log("Error: ", error);
    } finally {
      setOpenDeletDepo(false);
      setOpenDepositosDialog(false);
      setSelectedDepo(undefined);
      setSelectedMeta(undefined);
    }
  };

  /* ========================= Aggregate helpers (estadísticas) ========================= */

  /* Metas tienda */
  const getMetasTiendaTotal = () =>
    metasTiendaSummary.reduce((acc, meta) => acc + meta.montoMeta, 0);

  const getMetasTiendaAvance = () =>
    metasTiendaSummary.reduce((acc, meta) => acc + meta.montoActual, 0);

  const getMetasTiendaRestante = () =>
    getMetasTiendaTotal() - getMetasTiendaAvance();

  const getPercentTiendaCobro = () => {
    const montoMeta = metasTiendaSummary.reduce(
      (acc, m) => acc + m.montoMeta,
      0
    );
    const montoActual = metasTiendaSummary.reduce(
      (acc, m) => acc + m.montoActual,
      0
    );
    return montoMeta > 0 ? (montoActual / montoMeta) * 100 : 0;
  };

  /* Metas cobros */
  const getMetasCobroTotal = () =>
    metasCobrosSummary.reduce((acc, meta) => acc + meta.montoMeta, 0);

  const getMetasCobroAvance = () =>
    metasCobrosSummary.reduce((acc, meta) => acc + meta.montoActual, 0);

  const getMetasCobroRestante = () =>
    getMetasCobroTotal() - getMetasCobroAvance();

  const getPercentMetaCobro = () => {
    const montoMeta = metasCobrosSummary.reduce(
      (acc, m) => acc + m.montoMeta,
      0
    );
    const montoActual = metasCobrosSummary.reduce(
      (acc, m) => acc + m.montoActual,
      0
    );
    return montoMeta > 0 ? (montoActual / montoMeta) * 100 : 0;
  };
  const isSuperAdmin: boolean = userRol !== "SUPER_ADMIN" ? true : false;

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Metas"
        subtitle="Administre sus metas de ventas y cobros"
        sticky={false}
        fallbackBackTo="/"
      />
      <Tabs defaultValue="asignar" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 ">
          <TabsTrigger value="asignar">
            <Target className="w-4 h-4 mr-2" />
            Asignar Metas
          </TabsTrigger>
          <TabsTrigger value="tiendas">
            <Store className="w-4 h-4 mr-2" />
            Metas de Tiendas
          </TabsTrigger>
          <TabsTrigger value="cobros" className="truncate">
            <CreditCard className="w-4 h-4 mr-2" />
            Metas de Cobros
          </TabsTrigger>

          <TabsTrigger value="totales">
            <CreditCard className="w-4 h-4 mr-2" />
            Totales
          </TabsTrigger>
        </TabsList>
        <TabsContent value="asignar">
          <Card>
            <CardHeader>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usuario">Usuario</Label>
                    <SelectComponent
                      isClearable
                      className="text-black"
                      placeholder="Seleccione un usuario"
                      id="usuario"
                      value={opcionSeleccionada} // Vinculo esto para que pueda limpiar el input cuando sea success
                      options={optionsUsuarios}
                      onChange={handleChangeUser}
                    ></SelectComponent>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipoMeta">Tipo de Meta</Label>
                    {/* Recibirá un tipo de dato que solo sea del type definido, lo especifico aqui en el onValueChange */}
                    <Select
                      value={metaDto.tipoMeta}
                      onValueChange={(value: TipoMeta) =>
                        setMetaDto((datosprevios) => ({
                          ...datosprevios,
                          tipoMeta: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={metaDto.tipoMeta} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tienda">Tienda</SelectItem>
                        <SelectItem value="Cobro">Cobro</SelectItem>
                      </SelectContent>
                    </Select>
                    {metaDto.tipoMeta && (
                      <p className="text-sm">
                        La meta seleccionada es de {metaDto.tipoMeta}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titulo">Titulo de la meta</Label>
                    <Input
                      value={metaDto.tituloMeta || ""}
                      onChange={(e) =>
                        setMetaDto((datosprevios) => ({
                          ...datosprevios,
                          tituloMeta: e.target.value,
                        }))
                      }
                      id="titulo"
                      placeholder="Meta del mes de enero 2025 (opcional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="montoMeta">Monto de la Meta</Label>
                    <Input
                      value={metaDto.montoMeta}
                      onChange={(e) =>
                        setMetaDto((datosprevios) => ({
                          ...datosprevios,
                          montoMeta: Number(e.target.value),
                        }))
                      }
                      id="montoMeta"
                      type="number"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaFin">Fecha Límite</Label>
                    <Input
                      value={metaDto.fechaFin}
                      onChange={(e) =>
                        setMetaDto((datosprevios) => ({
                          ...datosprevios,
                          fechaFin: e.target.value,
                        }))
                      }
                      id="fechaFin"
                      type="date"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSubmitGoal}
                >
                  Asignar Meta
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB PAR METAS DE TIENDAS */}
        <TabsContent value="tiendas">
          <Card>
            <div className="flex gap-2 flex-col md:flex-row">
              {/* RESUMEN DE METAS DE COBROS EN TIENDAS */}
              <Card className="shadow-sm w-full m-2">
                <CardHeader className="py-1 px-4">
                  <CardTitle className="text-sm">
                    Resumen de metas de tiendas
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Meta total
                      </span>
                      <div className="flex items-center">
                        <TargetIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-bold">
                          {formatearMoneda(getMetasTiendaTotal())}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Avance
                      </span>
                      <div className="flex items-center">
                        <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-sm font-bold">
                          {formatearMoneda(getMetasTiendaAvance())}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Faltante
                      </span>
                      <div className="flex items-center">
                        <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
                        <span className="text-sm font-bold">
                          {formatearMoneda(getMetasTiendaRestante())}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Progreso</span>
                      <span className="text-xs font-medium">
                        {getPercentTiendaCobro().toFixed(2)}%
                      </span>
                    </div>
                    <Progress
                      value={getPercentTiendaCobro()}
                      className={cn(
                        "w-full h-2",
                        getPercentTiendaCobro() >= 100
                          ? "[&>div]:bg-green-500"
                          : getPercentTiendaCobro() >= 75
                          ? "[&>div]:bg-blue-500"
                          : getPercentTiendaCobro() >= 50
                          ? "[&>div]:bg-yellow-500"
                          : "[&>div]:bg-red-500"
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <h2 className="py-2 text-lg font-semibold px-2 text-center">
              Metas de Tiendas
            </h2>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="h-5">
                      <TableHead className="py-0">Título</TableHead>
                      <TableHead className="py-0">Usuario</TableHead>
                      <TableHead className="py-0">Meta</TableHead>
                      <TableHead className="py-0">Actual</TableHead>
                      <TableHead className="py-0">Faltante</TableHead>
                      <TableHead className="py-0">%</TableHead>
                      <TableHead className="py-0">Ref.</TableHead>
                      <TableHead className="py-0">Dif.</TableHead>
                      <TableHead className="py-0">Estado</TableHead>
                      <TableHead className="py-0 w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-[0.8rem]">
                    {filteredMetasTienda.map((meta) => {
                      const porcentaje =
                        meta.montoMeta > 0
                          ? (meta.montoActual / meta.montoMeta) * 100
                          : 0;
                      return (
                        <TableRow key={meta.id} className="h-8">
                          <TableCell className="py-0">
                            {meta.tituloMeta || ""}
                          </TableCell>
                          <TableCell className="py-0">
                            {meta.usuario.nombre}
                          </TableCell>
                          <TableCell className="py-0">
                            {formatearMoneda(meta.montoMeta)}
                          </TableCell>
                          <TableCell className="py-0">
                            {formatearMoneda(meta.montoActual)}
                          </TableCell>
                          <TableCell className="py-0">
                            {formatearMoneda(meta.montoMeta - meta.montoActual)}
                          </TableCell>

                          {/* Porcentaje */}
                          <TableCell className="py-0">
                            <div className="flex items-center gap-1">
                              <Percent
                                className={`w-3 h-3 ${
                                  porcentaje >= 70
                                    ? "text-green-500"
                                    : porcentaje >= 40
                                    ? "text-yellow-500"
                                    : "text-red-500"
                                }`}
                              />
                              <span>{porcentaje.toFixed(0)}%</span>
                            </div>
                          </TableCell>

                          {/* Referencia */}
                          <TableCell className="py-0">
                            <div className="flex items-center gap-1">
                              <Clock
                                className={`w-3 h-3 ${
                                  calcularReferencia() >= 70
                                    ? "text-green-500"
                                    : calcularReferencia() >= 40
                                    ? "text-yellow-500"
                                    : "text-red-500"
                                }`}
                              />
                              <span>{calcularReferencia().toFixed(0)}%</span>
                            </div>
                          </TableCell>

                          {/* Diferencia */}
                          <TableCell className="py-0">
                            <div className="flex items-center gap-1">
                              {porcentaje - calcularReferencia() >= 0 ? (
                                <TrendingUp className="w-3 h-3 text-green-500" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                              )}
                              <span
                                className={
                                  porcentaje - calcularReferencia() >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {Math.abs(
                                  porcentaje - calcularReferencia()
                                ).toFixed(0)}
                                %
                              </span>
                            </div>
                          </TableCell>

                          {/* Estado */}
                          <TableCell className="py-0">
                            {meta.estado === EstadoMetaTienda.FINALIZADO ? (
                              <div className="flex items-center gap-1 text-green-500">
                                <CheckCircle className="w-3 h-3" />
                                <span>Cumplida</span>
                              </div>
                            ) : meta.estado === EstadoMetaTienda.CERRADO ? (
                              <div className="flex items-center gap-1 text-violet-500">
                                <XCircle className="w-3 h-3" />
                                <span>Cerrada</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Clock className="w-3 h-3" />
                                <span>En progreso</span>
                              </div>
                            )}
                          </TableCell>

                          {/* Acciones */}
                          <TableCell className="py-0 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  <MoreVertical className="h-4 w-4 text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-36 shadow-lg rounded-md border border-gray-200"
                              >
                                <DropdownMenuItem
                                  onClick={() => {
                                    setOpenUpdateMetaTienda(true);
                                    setMetaTiendaSelected(meta);
                                  }}
                                  disabled={isSuperAdmin}
                                  className="flex items-center gap-2 hover:bg-gray-100 text-xs py-1"
                                >
                                  <Edit className="h-3 w-3 text-blue-500" />
                                  <span>Actualizar</span>
                                </DropdownMenuItem>
                                <div className="h-px bg-gray-200 my-0.5" />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setGoalToDelete(meta.id);
                                    setOpenDeleteG(true);
                                  }}
                                  disabled={isSuperAdmin}
                                  className="flex items-center gap-2 text-red-500 hover:bg-red-100 text-xs py-1"
                                >
                                  <Delete className="h-3 w-3" />
                                  <span>Eliminar</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* TAB PAR METAS DE TIENDAS */}

        {/* TAB PAR METAS DE COBRO */}
        <TabsContent value="cobros">
          <Card>
            <div className="flex gap-2 flex-col md:flex-row">
              {/* RESUMEN DE METAS DE COBROS*/}
              <Card className="shadow-sm w-full m-2">
                <CardHeader className="py-1 px-4">
                  <CardTitle className="text-sm">
                    Resumen de metas de cobros
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Meta total
                      </span>
                      <div className="flex items-center">
                        <TargetIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-bold">
                          {formatearMoneda(getMetasCobroTotal())}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Avance
                      </span>
                      <div className="flex items-center">
                        <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-sm font-bold">
                          {formatearMoneda(getMetasCobroAvance())}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Faltante
                      </span>
                      <div className="flex items-center">
                        <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
                        <span className="text-sm font-bold">
                          {formatearMoneda(getMetasCobroRestante())}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Progreso</span>
                      <span className="text-xs font-medium">
                        {getPercentMetaCobro().toFixed(2)}%
                      </span>
                    </div>
                    <Progress
                      value={getPercentMetaCobro()}
                      className={cn(
                        "w-full h-2",
                        getPercentMetaCobro() >= 100
                          ? "[&>div]:bg-green-500"
                          : getPercentMetaCobro() >= 75
                          ? "[&>div]:bg-blue-500"
                          : getPercentMetaCobro() >= 50
                          ? "[&>div]:bg-yellow-500"
                          : "[&>div]:bg-red-500"
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <h2 className="py-2 text-lg font-semibold px-2 text-center">
              Metas de Cobros
            </h2>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="h-5">
                      <TableHead className="py-0">Título</TableHead>
                      <TableHead className="py-0">Usuario</TableHead>
                      <TableHead className="py-0">Meta</TableHead>
                      <TableHead className="py-0">Actual</TableHead>
                      <TableHead className="py-0">Faltante</TableHead>
                      <TableHead className="py-0">%</TableHead>
                      <TableHead className="py-0">Ref.</TableHead>
                      <TableHead className="py-0">Dif.</TableHead>
                      <TableHead className="py-0">Estado</TableHead>
                      <TableHead className="py-0 w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-[0.8rem]">
                    {filteredMetasCobros.map((meta) => {
                      const porcentaje =
                        meta.montoMeta > 0
                          ? (meta.montoActual / meta.montoMeta) * 100
                          : 0;
                      const referencia = calcularReferencia();
                      const diferencia = porcentaje - referencia;

                      return (
                        <TableRow key={meta.id} className="h-8">
                          {/* Título */}
                          <TableCell className="py-0">
                            {meta.tituloMeta || "Sin título"}
                          </TableCell>

                          {/* Usuario */}
                          <TableCell className="py-0">
                            {meta.usuario.nombre}
                          </TableCell>

                          {/* Monto Meta */}
                          <TableCell className="py-0">
                            {formatearMoneda(meta.montoMeta)}
                          </TableCell>

                          {/* Monto Actual */}
                          <TableCell className="py-0">
                            {formatearMoneda(meta.montoActual)}
                          </TableCell>

                          {/* Faltante */}
                          <TableCell className="py-0">
                            {formatearMoneda(meta.montoMeta - meta.montoActual)}
                          </TableCell>

                          {/* Porcentaje de progreso */}
                          <TableCell className="py-0">
                            <div className="flex items-center gap-1">
                              <Percent
                                className={`w-3 h-3 ${
                                  porcentaje >= 70
                                    ? "text-green-500"
                                    : porcentaje >= 40
                                    ? "text-yellow-500"
                                    : "text-red-500"
                                }`}
                              />
                              <span>{porcentaje.toFixed(0)}%</span>
                            </div>
                          </TableCell>

                          {/* Referencia */}
                          <TableCell className="py-0">
                            <div className="flex items-center gap-1">
                              <Clock
                                className={`w-3 h-3 ${
                                  referencia >= 70
                                    ? "text-green-500"
                                    : referencia >= 40
                                    ? "text-yellow-500"
                                    : "text-red-500"
                                }`}
                              />
                              <span>{referencia.toFixed(0)}%</span>
                            </div>
                          </TableCell>

                          {/* Diferencia */}
                          <TableCell className="py-0">
                            <div className="flex items-center gap-1">
                              {diferencia >= 0 ? (
                                <TrendingUp className="w-3 h-3 text-green-500" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                              )}
                              <span
                                className={
                                  diferencia >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {Math.abs(diferencia).toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>

                          {/* Estado */}
                          <TableCell className="py-0">
                            {meta.estado === EstadoMetaCobro.FINALIZADO ? (
                              <div className="flex items-center gap-1 text-green-500">
                                <CheckCircle className="w-3 h-3" />
                                <span>Cumplida</span>
                              </div>
                            ) : meta.estado === EstadoMetaCobro.CERRADO ? (
                              <div className="flex items-center gap-1 text-violet-500">
                                <XCircle className="w-3 h-3" />
                                <span>Cerrada</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Clock className="w-3 h-3" />
                                <span>En progreso</span>
                              </div>
                            )}
                          </TableCell>

                          {/* Acciones */}
                          <TableCell className="py-0 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  <MoreVertical className="h-4 w-4 text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent
                                align="end"
                                className="w-36 shadow-lg rounded-md border border-gray-200"
                              >
                                {/* Opción para ver depósitos */}
                                <DropdownMenuItem
                                  onClick={() => handleOpenDepositos(meta)}
                                  className="flex items-center gap-2 hover:bg-gray-100 text-xs py-1"
                                >
                                  <Coins className="h-3 w-3 text-yellow-500" />
                                  <span>Depósitos</span>
                                </DropdownMenuItem>

                                {/* Separador */}
                                <div className="h-px bg-gray-200 my-0.5" />

                                {/* Opción para actualizar */}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setMetaCobroSelected(meta);
                                    setOpenUpdateMetaCobro(true);
                                  }}
                                  className="flex items-center gap-2 hover:bg-gray-100 text-xs py-1"
                                >
                                  <Edit className="h-3 w-3 text-blue-500" />
                                  <span>Actualizar</span>
                                </DropdownMenuItem>

                                {/* Separador */}
                                <div className="h-px bg-gray-200 my-0.5" />

                                {/* Opción para eliminar */}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setCobroToDelete(meta.id);
                                    setOpenDeleteCobro(true);
                                  }}
                                  className="flex items-center gap-2 text-red-500 hover:bg-red-100 text-xs py-1"
                                >
                                  <Delete className="h-3 w-3" />
                                  <span>Eliminar</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Dialog para mostrar depósitos */}
              <Dialog
                open={openDepositosDialog}
                onOpenChange={setOpenDepositosDialog}
              >
                {selectedMeta && (
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        Depósitos de{" "}
                        {selectedMeta.tituloMeta ? selectedMeta.tituloMeta : ""}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                      {selectedMeta.DepositoCobro.length > 0 ? (
                        <div className="space-y-4">
                          {selectedMeta.DepositoCobro.map((deposito) => (
                            <div
                              key={deposito.id}
                              className="bg-muted rounded-lg p-4 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Banknote className="w-5 h-5 text-primary" />
                                  <span className="font-semibold">
                                    Boleta: {deposito.numeroBoleta}
                                  </span>
                                </div>
                                <Button
                                  onClick={() => {
                                    setSelectedDepo(deposito);
                                    setOpenDeletDepo(true);
                                  }}
                                  variant="destructive"
                                  size="icon"
                                  className="h-8 w-8"
                                  aria-label={`Eliminar depósito ${deposito.numeroBoleta}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Coins className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  {formatearMoneda(deposito.montoDepositado)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  {new Date(
                                    deposito.fechaRegistro
                                  ).toLocaleString()}
                                </span>
                              </div>
                              {deposito.descripcion && (
                                <div className="flex items-start space-x-2">
                                  <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                                  <p className="text-sm">
                                    {deposito.descripcion}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          No hay depósitos registrados.
                        </p>
                      )}
                    </ScrollArea>
                    <DialogFooter>
                      <Button
                        onClick={() => setOpenDepositosDialog(false)}
                        className="w-full sm:w-auto"
                      >
                        Cerrar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                )}
              </Dialog>

              {/* DIALOG PARA ELIMINAR UN PAGO */}
              <Dialog open={openDeletDepo} onOpenChange={setOpenDeletDepo}>
                {selectedDepo && (
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Confirmar Eliminación
                      </DialogTitle>
                      <DialogDescription>
                        ¿Estás seguro de que deseas eliminar el depósito con
                        boleta número {selectedDepo?.numeroBoleta}?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                      <Button
                        className="w-full"
                        variant="destructive"
                        onClick={() => {
                          onConfirmDelete();
                        }}
                      >
                        Eliminar
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => setOpenDeletDepo(false)}
                      >
                        Cancelar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                )}
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
        {/* TAB PAR METAS DE COBRO */}
        <TabsContent value="totales">
          {/* Resumen de metas de cobros */}
          <Card className="my-1 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">
                Resumen de metas de cobros
              </CardTitle>
              <CardDescription className="text-xs">
                Avance de todas las metas de cobro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Meta total
                  </span>
                  <div className="flex items-center">
                    <TargetIcon className="mr-2 h-3 w-3 text-muted-foreground" />
                    <span className="text-base font-semibold">
                      {formatearMoneda(getMetasCobroTotal())}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Avance</span>
                  <div className="flex items-center">
                    <ArrowUpIcon className="mr-2 h-3 w-3 text-green-500" />
                    <span className="text-base font-semibold">
                      {formatearMoneda(getMetasCobroAvance())}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Faltante
                  </span>
                  <div className="flex items-center">
                    <ArrowDownIcon className="mr-2 h-3 w-3 text-red-500" />
                    <span className="text-base font-semibold">
                      {formatearMoneda(getMetasCobroRestante())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">Progreso</span>
                  <span className="text-xs font-medium">
                    {getPercentMetaCobro().toFixed(2)}%
                  </span>
                </div>
                <Progress
                  value={getPercentMetaCobro()}
                  className={cn(
                    "w-full h-3",
                    getPercentMetaCobro() >= 100
                      ? "[&>div]:bg-green-500"
                      : getPercentMetaCobro() >= 75
                      ? "[&>div]:bg-blue-500"
                      : getPercentMetaCobro() >= 50
                      ? "[&>div]:bg-yellow-500"
                      : "[&>div]:bg-red-500"
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumen de metas de tiendas */}
          <Card className="my-1 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">
                Resumen de metas de tiendas
              </CardTitle>
              <CardDescription className="text-xs">
                Avance de todas las metas de tienda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Meta total
                  </span>
                  <div className="flex items-center">
                    <TargetIcon className="mr-2 h-3 w-3 text-muted-foreground" />
                    <span className="text-base font-semibold">
                      {formatearMoneda(getMetasTiendaTotal())}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Avance</span>
                  <div className="flex items-center">
                    <ArrowUpIcon className="mr-2 h-3 w-3 text-green-500" />
                    <span className="text-base font-semibold">
                      {formatearMoneda(getMetasTiendaAvance())}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Faltante
                  </span>
                  <div className="flex items-center">
                    <ArrowDownIcon className="mr-2 h-3 w-3 text-red-500" />
                    <span className="text-base font-semibold">
                      {formatearMoneda(getMetasTiendaRestante())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">Progreso</span>
                  <span className="text-xs font-medium">
                    {getPercentTiendaCobro().toFixed(2)}%
                  </span>
                </div>
                <Progress
                  value={getPercentTiendaCobro()}
                  className={cn(
                    "w-full h-3",
                    getPercentTiendaCobro() >= 100
                      ? "[&>div]:bg-green-500"
                      : getPercentTiendaCobro() >= 75
                      ? "[&>div]:bg-blue-500"
                      : getPercentTiendaCobro() >= 50
                      ? "[&>div]:bg-yellow-500"
                      : "[&>div]:bg-red-500"
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumen de metas combinadas */}
          <Card className="my-1 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">
                Resumen de metas combinadas
              </CardTitle>
              <CardDescription className="text-xs">
                Avance de todas las metas de cobro y tienda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Meta total
                  </span>
                  <div className="flex items-center">
                    <TargetIcon className="mr-2 h-3 w-3 text-muted-foreground" />
                    <span className="text-base font-semibold">
                      {formatearMoneda(
                        getMetasCobroTotal() + getMetasTiendaTotal()
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Avance</span>
                  <div className="flex items-center">
                    <ArrowUpIcon className="mr-2 h-3 w-3 text-green-500" />
                    <span className="text-base font-semibold">
                      {formatearMoneda(
                        getMetasCobroAvance() + getMetasTiendaAvance()
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Faltante
                  </span>
                  <div className="flex items-center">
                    <ArrowDownIcon className="mr-2 h-3 w-3 text-red-500" />
                    <span className="text-base font-semibold">
                      {formatearMoneda(
                        getMetasCobroRestante() + getMetasTiendaRestante()
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">Progreso</span>
                  <span className="text-xs font-medium">
                    {(
                      ((getMetasCobroAvance() + getMetasTiendaAvance()) /
                        (getMetasCobroTotal() + getMetasTiendaTotal())) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    ((getMetasCobroAvance() + getMetasTiendaAvance()) /
                      (getMetasCobroTotal() + getMetasTiendaTotal())) *
                    100
                  }
                  className={cn(
                    "w-full h-3",
                    ((getMetasCobroAvance() + getMetasTiendaAvance()) /
                      (getMetasCobroTotal() + getMetasTiendaTotal())) *
                      100 >=
                      100
                      ? "[&>div]:bg-green-500"
                      : ((getMetasCobroAvance() + getMetasTiendaAvance()) /
                          (getMetasCobroTotal() + getMetasTiendaTotal())) *
                          100 >=
                        75
                      ? "[&>div]:bg-blue-500"
                      : ((getMetasCobroAvance() + getMetasTiendaAvance()) /
                          (getMetasCobroTotal() + getMetasTiendaTotal())) *
                          100 >=
                        50
                      ? "[&>div]:bg-yellow-500"
                      : "[&>div]:bg-red-500"
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG PARA ELIMINACIONES DE METAS EN TIENDAS */}
      <Dialog open={openDeleteG} onOpenChange={setOpenDeleteG}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-center">
              <p className="text-center">Confirmación de eliminación de meta</p>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¿Estás seguro de eliminar este registro? Esta acción no se puede
              deshacer.
            </p>
            <div className="mt-4 space-y-4">
              <div className="relative">
                <Input
                  onChange={(e) => setPasswordAdmin(e.target.value)}
                  value={passwordAdmin}
                  placeholder="Introduzca su contraseña de administrador"
                  type="password"
                  className="pl-10 pr-4 py-2"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setOpenDeleteG(false)}
                className="w-full "
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteMeta}
                variant="destructive"
                className="w-full "
              >
                <Check className="mr-2 h-4 w-4" />
                Sí, eliminar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG PARA ELIMINACIONES DE METAS EN COBROS */}
      <Dialog open={openDeleteCobro} onOpenChange={setOpenDeleteCobro}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-center">
              <p className="text-center">
                Confirmación de eliminación de meta en cobros
              </p>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¿Estás seguro de eliminar este registro? Esta acción no se puede
              deshacer.
            </p>
            <div className="mt-4 space-y-4">
              <div className="relative">
                <Input
                  onChange={(e) => setPasswordAdminCobro(e.target.value)}
                  value={passwordAdminCobro}
                  placeholder="Introduzca su contraseña de administrador"
                  type="password"
                  className="pl-10 pr-4 py-2"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setOpenDeleteCobro(false)}
                className="w-full "
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteCobro}
                variant="destructive"
                className="w-full "
              >
                <Check className="mr-2 h-4 w-4" />
                Sí, eliminar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG PARA ACTUALIZACION DE METAS DE TIENDAS*/}
      <EditMetaTiendaDialog
        open={openUpdateMetaTienda}
        onClose={() => setOpenUpdateMetaTienda(false)}
        metaTienda={metaTiendaSelected}
      />

      <EditMetaCobroDialog
        open={openUpdateMetaCobro}
        onClose={() => setOpenUpdateMetaCobro(false)}
        metaCobro={metaCobroSelected}
      />
    </div>
  );
}

export default Metas;
